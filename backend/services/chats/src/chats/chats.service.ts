import { ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { pgErrorCode } from '@pep/shared'
import { eq, desc, inArray, notInArray } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { conversations, conversationMembers, messages } from '../database/schema'
import { DB } from '../database/database.module'
import { UsersProxyService } from './users-proxy.service'
import { PostsProxyService } from './posts-proxy.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { CreateMessageDto } from './dto/create-message.dto'
import { ChatsGateway, CHAT_EVENTS } from './chats.gateway'

type ConversationMember = { id: number, username: string }

const DELETED_POST_TITLE = 'Object deleted'

@Injectable()
export class ChatsService {
	constructor(
		@Inject(DB) private db : PostgresJsDatabase,
		private readonly chatsGateway: ChatsGateway,
		private readonly usersProxy: UsersProxyService,
		private readonly postsProxy: PostsProxyService,
	) {}

	// Titles live in the posts service. A post that no longer exists keeps its conversation, titled as deleted.
	private async findPostTitles(postIds: number[]) {
		if (postIds.length === 0)
			return new Map<number, string>()

		const posts = await this.postsProxy.findManyByIds(postIds)
		return new Map(posts.map((post) => [post.id, post.title]))
	}

	private async findMemberIds(conversationId: number) {
		const members = await this.db
				.select({ userId: conversationMembers.userId })
				.from(conversationMembers)
				.where(eq(conversationMembers.conversationId, conversationId))

		return members.map((member) => member.userId)
	}

	// Members of several conversations at once, so a list never queries per row.
	// Usernames live in the auth service, so they are fetched from there once per distinct user.
	private async findMembersByConversation(conversationIds: number[]) {
		const byConversation = new Map<number, ConversationMember[]>()

		if (conversationIds.length === 0)
			return byConversation

		const rows = await this.db
				.select({
					conversationId: conversationMembers.conversationId,
					userId: conversationMembers.userId,
				})
				.from(conversationMembers)
				.where(inArray(conversationMembers.conversationId, conversationIds))
				.orderBy(conversationMembers.id)

		const users = await this.usersProxy.findManyByIds(rows.map((row) => row.userId))
		const usernameById = new Map(users.map((user) => [user.id, user.username]))

		for (const { conversationId, userId } of rows) {
			const username = usernameById.get(userId)
			if (username === undefined)
				continue

			const members = byConversation.get(conversationId) ?? []
			members.push({ id: userId, username })
			byConversation.set(conversationId, members)
		}

		return byConversation
	}

	async stats(userId: number) {
		const myConversations = await this.db
			.select({ conversationId: conversationMembers.conversationId })
			.from(conversationMembers)
			.where(eq(conversationMembers.userId, userId))

		const myMessages = await this.db
			.select({ createdAt: messages.createdAt })
			.from(messages)
			.where(eq(messages.ownerId, userId))

		const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		let topDay: string | null = null
		let topCount = 0
		for (let day = 0; day < days.length; day++) {
			const count = myMessages.filter((message) => message.createdAt.getUTCDay() === day).length
			if (count > topCount) {
				topDay = days[day]
				topCount = count
			}
		}

		return ({ conversations: myConversations.length, topDay })
	}

	async findMy(userId: number) {
		const rows = await this.db
				.select({
					id: conversations.id,
					postId: conversations.postId,
					createdAt: conversations.createdAt,
					updatedAt: conversations.updatedAt,
				})
				.from(conversations)
				.innerJoin(conversationMembers, eq(conversationMembers.conversationId, conversations.id))
				.where(eq(conversationMembers.userId, userId))
				.orderBy(desc(conversations.updatedAt))

		// The client names a conversation after the people in it, not its id
		const membersByConversation = await this.findMembersByConversation(rows.map((row) => row.id))

		// The header shows the post the chat is about; the client only gets { id, title }, never the raw postId
		const titleByPostId = await this.findPostTitles(rows.map((row) => row.postId))

		return rows.map(({ postId, ...conversation }) => ({
			...conversation,
			members: membersByConversation.get(conversation.id) ?? [],
			post: { id: postId, title: titleByPostId.get(postId) ?? DELETED_POST_TITLE },
		}))
	}

	async findByIdOrThrow(conversationId: number) {
		const [conversation] = await this.db
				.select()
				.from(conversations)
				.where(eq(conversations.id, conversationId))

		if (!conversation)
			throw new NotFoundException('Conversation not found')

		return conversation
	}

	findMessages(conversationId: number) {
		return this.db
				.select()
				.from(messages)
				.where(eq(messages.conversationId, conversationId))
				.orderBy(messages.createdAt)
	}

	async createConversation(userId: number, dto: CreateConversationDto) {
		if (dto.recipientId === userId)
			throw new ForbiddenException('You cannot start a conversation with yourself')

		try {
			await this.usersProxy.findById(dto.recipientId)
		} catch (err) {
			if (err instanceof NotFoundException)
				throw new NotFoundException('User not found')
			throw err
		}

		// post_id has no foreign key (posts live in another service), so existence is checked here before anything is written
		const post = await this.postsProxy.findById(dto.postId)

		let created
		try {
			created = await this.db.transaction(async (t) => {
				const [conversation] = await t
						.insert(conversations)
						.values({ postId: dto.postId })
						.returning()

				await t
						.insert(conversationMembers)
						.values([
							{ conversationId: conversation.id, userId },
							{ conversationId: conversation.id, userId: dto.recipientId },
						])

				const [message] = await t
						.insert(messages)
						.values({
							conversationId: conversation.id,
							ownerId: userId,
							content: dto.content
						})
						.returning()

				return ({ conversation, message })
			})
		} catch (err: unknown) {
			if (pgErrorCode(err) === '23503')
				throw new UnauthorizedException('User no longer exists')
			throw err
		}

		// Carries its members like findMy does, so a brand new conversation is named right away
		const membersByConversation = await this.findMembersByConversation([created.conversation.id])
		// Same shape as findMy: the post title is resolved from the check above, no second call to posts
		const { postId, ...conversation } = created.conversation
		const payload = {
			conversation: {
				...conversation,
				members: membersByConversation.get(conversation.id) ?? [],
				post: { id: postId, title: post.title },
			},
			message: created.message,
		}

		// Emitted after commit so clients never hear about rows that could still be rolled back
		this.chatsGateway.emitToUsers([userId, dto.recipientId], CHAT_EVENTS.conversationNew, payload)

		return payload
	}

	async createMessage(conversationId: number, userId: number, dto: CreateMessageDto) {
		const message = await this.db.transaction(async (t) => {
			const [message] = await t
					.insert(messages)
					.values({
						conversationId,
						ownerId: userId,
						content: dto.content
					})
					.returning()

			await t
					.update(conversations)
					.set({ updatedAt: new Date() })
					.where(eq(conversations.id, conversationId))

			return message
		})

		const memberIds = await this.findMemberIds(conversationId)
		this.chatsGateway.emitToUsers(memberIds, CHAT_EVENTS.messageNew, message)

		return message
	}

	async removeForUser(userId: number): Promise<number> {
		return (this.db.transaction(async (t) => {
			await t.delete(messages).where(eq(messages.ownerId, userId))
			await t.delete(conversationMembers).where(eq(conversationMembers.userId, userId))

			const orphaned = await t
				.delete(conversations)
				.where(
					notInArray(
						conversations.id,
						t
							.selectDistinct({ id: conversationMembers.conversationId })
							.from(conversationMembers),
					),
				)
				.returning({ id: conversations.id })

			return (orphaned.length)
		}))
	}
}
