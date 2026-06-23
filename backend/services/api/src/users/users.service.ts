import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { users } from '../../schema'
import { DB } from '../database/database.module'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UsersService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	findAll() {
		return (this.db.select().from(users).orderBy(users.id))
	}

	create(dto: CreateUserDto) {
		return (this.db.insert(users).values(dto).returning())
	}

	remove(id: number) {
		return (this.db.delete(users).where(eq(users.id, id)))
	}
}