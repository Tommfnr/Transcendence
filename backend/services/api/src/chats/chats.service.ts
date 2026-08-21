import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq, and, or, desc } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { conversations, messages, posts } from '../database/schema'
import { DB } from '../database/database.module'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { CreateMessageDto } from './dto/create-message.dto'

@Injectable()
export class ChatsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	findMy(userId: number) {
		return this.db
				.select({
					id: conversations.id,
					postId: conversations.postId,
					requesterId: conversations.requesterId,
					createdAt: conversations.createdAt,
					updatedAt: conversations.updatedAt,
					postTitle: posts.title,
					postOwnerId: posts.ownerId,
				})
				.from(conversations)
				.innerJoin(posts, eq(conversations.postId, posts.id))
				.where(or(eq(conversations.requesterId, userId), eq(posts.ownerId, userId)))
				.orderBy(desc(conversations.updatedAt))
	}

	async findOne(conversationId: number, userId: number) {
		const [conversation] = await this.db
				.select({
					id: conversations.id,
					postId: conversations.postId,
					requesterId: conversations.requesterId,
					createdAt: conversations.createdAt,
					updatedAt: conversations.updatedAt,
					postOwnerId: posts.ownerId,
				})
				.from(conversations)
				.innerJoin(posts, eq(conversations.postId, posts.id))
				.where(eq(conversations.id, conversationId))

		if (!conversation)
			throw new NotFoundException('Conversation not found')
		if (conversation.requesterId !== userId && conversation.postOwnerId !== userId)
			throw new ForbiddenException('You are not part of this conversation')

		return conversation
	}

	async findMessages(conversationId: number, userId: number) {
		await this.findOne(conversationId, userId)

		return this.db
				.select()
				.from(messages)
				.where(eq(messages.conversationId, conversationId))
				.orderBy(messages.createdAt)
	}

	async create(userId: number, dto: CreateConversationDto) {
		return this.db.transaction(async (t) => {
			const { postId, content } = dto

			const [post] = await t.select().from(posts).where(eq(posts.id, postId))

			if (!post)
				throw new NotFoundException('Post not found')
			if (post.ownerId === userId)
				throw new ForbiddenException('You cannot message yourself about your own post')

			const [existing] = await t
					.select()
					.from(conversations)
					.where(and(eq(conversations.postId, postId), eq(conversations.requesterId, userId)))

			if (existing)
				throw new ConflictException('Conversation already exists for this post, use POST /chats/:conversationId/messages instead')
			if (post.status === 'closed')
				throw new ForbiddenException('Cannot start a conversation on a closed post')

			const [conversation] = await t
					.insert(conversations)
					.values({ postId, requesterId: userId })
					.returning()

			const [message] = await t
					.insert(messages)
					.values({ conversationId: conversation.id, ownerId: userId, content })
					.returning()

			return ({ conversation, message })
		})
	}

	async createMessage(conversationId: number, userId: number, dto: CreateMessageDto) {
		return this.db.transaction(async (t) => {
			const [conversation] = await t
					.select({ id: conversations.id, requesterId: conversations.requesterId, postOwnerId: posts.ownerId })
					.from(conversations)
					.innerJoin(posts, eq(conversations.postId, posts.id))
					.where(eq(conversations.id, conversationId))

			if (!conversation)
				throw new NotFoundException('Conversation not found')
			if (conversation.requesterId !== userId && conversation.postOwnerId !== userId)
				throw new ForbiddenException('You are not part of this conversation')

			const [message] = await t
					.insert(messages)
					.values({ conversationId, ownerId: userId, content: dto.content })
					.returning()

			await t
					.update(conversations)
					.set({ updatedAt: new Date() })
					.where(eq(conversations.id, conversationId))

			return message
		})
	}
}
