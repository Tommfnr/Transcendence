import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq, desc } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { conversations, conversationMembers, messages, users } from '../database/schema'
import { DB } from '../database/database.module'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { CreateMessageDto } from './dto/create-message.dto'
import { ChatsGateway, CHAT_EVENTS } from './chats.gateway'

@Injectable()
export class ChatsService {
	constructor(
		@Inject(DB) private db : PostgresJsDatabase,
		private readonly chatsGateway: ChatsGateway,
	) {}

	private async findMemberIds(conversationId: number) {
		const members = await this.db
				.select({ userId: conversationMembers.userId })
				.from(conversationMembers)
				.where(eq(conversationMembers.conversationId, conversationId))

		return members.map((member) => member.userId)
	}

	findMy(userId: number) {
		return this.db
				.select({
					id: conversations.id,
					createdAt: conversations.createdAt,
					updatedAt: conversations.updatedAt,
				})
				.from(conversations)
				.innerJoin(conversationMembers, eq(conversationMembers.conversationId, conversations.id))
				.where(eq(conversationMembers.userId, userId))
				.orderBy(desc(conversations.updatedAt))
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
		const created = await this.db.transaction(async (t) => {
			if (dto.recipientId === userId)
				throw new ForbiddenException('You cannot start a conversation with yourself')

			const [recipient] = await t.select().from(users).where(eq(users.id, dto.recipientId))

			if (!recipient)
				throw new NotFoundException('User not found')

			const [conversation] = await t
					.insert(conversations)
					.values({})
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

		// Emitted after commit so clients never hear about rows that could still be rolled back
		this.chatsGateway.emitToUsers([userId, dto.recipientId], CHAT_EVENTS.conversationNew, created)

		return created
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
}
