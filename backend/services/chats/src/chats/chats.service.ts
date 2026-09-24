import { ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { pgErrorCode } from '@pep/shared'
import { eq, desc, notInArray } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { conversations, conversationMembers, messages } from '../database/schema'
import { DB } from '../database/database.module'
import { UsersProxyService } from './users-proxy.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { CreateMessageDto } from './dto/create-message.dto'

@Injectable()
export class ChatsService {
	constructor(
		@Inject(DB) private db : PostgresJsDatabase,
		private readonly usersProxy: UsersProxyService,
	) {}

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
		if (dto.recipientId === userId)
			throw new ForbiddenException('You cannot start a conversation with yourself')

		try {
			await this.usersProxy.findById(dto.recipientId)
		} catch (err) {
			if (err instanceof NotFoundException)
				throw new NotFoundException('User not found')
			throw err
		}

		try {
			return await this.db.transaction(async (t) => {
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
		} catch (err: unknown) {
			if (pgErrorCode(err) === '23503')
				throw new UnauthorizedException('User no longer exists')
			throw err
		}
	}

	async createMessage(conversationId: number, userId: number, dto: CreateMessageDto) {
		return this.db.transaction(async (t) => {
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
