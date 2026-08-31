import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { users } from '../database/schema'
import { DB } from '../database/database.module'
import { RegisterDto } from './dto/register.dto'
import * as argon2 from 'argon2'

@Injectable()
export class UsersService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	findAll() {
		return (this.db.select({ id: users.id, username: users.username, email: users.email}).from(users).orderBy(users.id))
	}

	findOne(loginIdentifier: string) {
		if (loginIdentifier.includes('@'))
			return (this.db.select().from(users).where(eq(users.email, loginIdentifier.toLowerCase())))
		else
			return (this.db.select().from(users).where(eq(users.username, loginIdentifier)))
	}

	async findById(id: number) {
		const [user] = await this.db.select({ id: users.id, username: users.username, email: users.email}).from(users).where(eq(users.id, id))
		return (user)
	}

	async create(dto: RegisterDto) {
		const h_password = await argon2.hash(dto.h_password)
		const [user] = await this.db.insert(users).values({ ...dto, h_password }).returning()		
	
		const { h_password: _, ...safeUser } = user
		return (safeUser)
	}

	remove(id: number) {
		return (this.db.delete(users).where(eq(users.id, id)))
	}
}