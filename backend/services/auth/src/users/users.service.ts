import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { and, eq, isNull } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { users, refreshTokens, apiKeys } from '../database/schema'
import { DB } from '../database/database.module'
import { RegisterDto } from './dto/register.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import * as argon2 from 'argon2'
import { EventPublisherService } from '../events/event-publisher.service'
import { EVENT, makeEvent, pgErrorCode, UserView } from '@pep/shared'

@Injectable()
export class UsersService {
	constructor(
		@Inject(DB) private db: PostgresJsDatabase,
		private readonly eventPublisher: EventPublisherService,
	) {}

	findAll(): Promise<UserView[]> {
		return (this.db
			.select({ id: users.id, username: users.username, email: users.email, deletedAt: users.deletedAt })
			.from(users)
			.where(isNull(users.deletedAt))
			.orderBy(users.id))
	}

	findOne(loginIdentifier: string) {
		if (loginIdentifier.includes('@'))
			return (this.db
				.select()
				.from(users)
				.where(and(eq(users.email, loginIdentifier.toLowerCase()), isNull(users.deletedAt))))
		else
			return (this.db
				.select()
				.from(users)
				.where(and(eq(users.username, loginIdentifier), isNull(users.deletedAt))))
	}

	async findById(id: number): Promise<UserView | undefined> {
		const [user] = await this.db
			.select({ id: users.id, username: users.username, email: users.email, deletedAt: users.deletedAt })
			.from(users)
			.where(eq(users.id, id))
		return (user)
	}

	async findByUsername(username: string): Promise<UserView> {
		const [user] = await this.db
			.select({ id: users.id, username: users.username, email: users.email, deletedAt: users.deletedAt })
			.from(users)
			.where(and(eq(users.username, username), isNull(users.deletedAt)))

		if (!user) {
			throw new NotFoundException('User not found')
		}
		return (user)
	}

	async create(dto: RegisterDto) {
		const h_password = await argon2.hash(dto.h_password)
		let user: typeof users.$inferSelect
		try {
			;[user] = await this.db.insert(users).values({ ...dto, h_password }).returning()
		}
		catch (err) {
			const code = (err as { cause?: { code?: string, constraint_name?: string } })?.cause?.code
			if (code === '23505') {
				throw new ConflictException('Email or username already exists')
			}
			throw err
		}
		const { h_password: _, ...safeUser } = user
		await this.eventPublisher.publish(makeEvent(EVENT.UserRegistered, 'auth', {
			userId: safeUser.id,
			username: safeUser.username,
			email: safeUser.email,
		}))
		return (safeUser)
	}

	async update(id: number, dto: UpdateUserDto): Promise<UserView | undefined> {
		let user: UserView | undefined
		try {
			;[user] = await this.db
				.update(users)
				.set({ username: dto.username, updatedAt: new Date() })
				.where(and(eq(users.id, id), isNull(users.deletedAt)))
				.returning({ id: users.id, username: users.username, email: users.email, deletedAt: users.deletedAt })
		}
		catch (err) {
			if (pgErrorCode(err) === '23505') {
				throw new ConflictException('Username already taken')
			}
			throw err
		}
		return (user)
	}

	async remove(id: number): Promise<boolean> {
		const deleted = await this.db
			.update(users)
			.set({ deletedAt: new Date(), h_password: '!deleted', updatedAt: new Date() })
			.where(and(eq(users.id, id), isNull(users.deletedAt)))
			.returning({ id: users.id })
		if (deleted.length === 0) {
			return (false)
		}
		await this.db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.userId, id))
		await this.db.delete(apiKeys).where(eq(apiKeys.userId, id))
		await this.eventPublisher.publish(makeEvent(EVENT.UserDeleted, 'auth', { userId: id }))
		return (true)
	}
}
