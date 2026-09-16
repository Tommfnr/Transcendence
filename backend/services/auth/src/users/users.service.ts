import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { users } from '../database/schema'
import { DB } from '../database/database.module'
import { RegisterDto } from './dto/register.dto'
import * as argon2 from 'argon2'
import { EVENT, makeEvent, UserView, EventPublisherService } from '@pep/shared'

@Injectable()
export class UsersService {
	constructor(
		@Inject(DB) private db: PostgresJsDatabase,
		private readonly eventPublisher: EventPublisherService,
	) {}

	findAll(): Promise<UserView[]> {
		return (this.db.select({ id: users.id, username: users.username, email: users.email }).from(users).orderBy(users.id))
	}

	findOne(loginIdentifier: string) {
		if (loginIdentifier.includes('@'))
			return (this.db.select().from(users).where(eq(users.email, loginIdentifier.toLowerCase())))
		else
			return (this.db.select().from(users).where(eq(users.username, loginIdentifier)))
	}

	async findById(id: number): Promise<UserView | undefined> {
		const [user] = await this.db
			.select({ id: users.id, username: users.username, email: users.email })
			.from(users)
			.where(eq(users.id, id))
		return (user)
	}

	async findByUsername(username: string): Promise<UserView> {
		const [user] = await this.db
			.select({ id: users.id, username: users.username, email: users.email })
			.from(users)
			.where(eq(users.username, username))

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

	async remove(id: number): Promise<boolean> {
		const deleted = await this.db.delete(users).where(eq(users.id, id)).returning({ id: users.id })
		if (deleted.length === 0) {
			return (false)
		}
		await this.eventPublisher.publish(makeEvent(EVENT.UserDeleted, 'auth', { userId: id }))
		return (true)
	}
}
