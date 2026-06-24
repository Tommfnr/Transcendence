import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { users } from '../../schema'
import { DB } from '../database/database.module'
import { CreateUserDto } from './dto/create-user.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	findAll() {
		return (this.db.select().from(users).orderBy(users.id))
	}

	async create(dto: CreateUserDto) {
		const h_password = await bcrypt.hash(dto.h_password, 10)
		const [user] = await this.db.insert(users).values({ ...dto, h_password }).returning()		
	
		const { h_password: _, ...safeUser } = user
		return (safeUser)
	}

	remove(id: number) {
		return (this.db.delete(users).where(eq(users.id, id)))
	}
}