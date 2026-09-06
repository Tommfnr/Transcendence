// Service files defines the functions used in backend
// See : https://docs.nestjs.com/providers#services

import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { objects } from '../database/schema'
import { DB } from '../database/database.module'
import { CreateObjectDto } from './dto/create-object.dto'
import { UpdateObjectDto } from './dto/update-object.dto'

@Injectable()
export class ObjectsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	findAll() {
		return (this.db.select().from(objects).orderBy(objects.id))
	}

	findByUserId(userId: number) {
			return (this.db
					.select()
					.from(objects)
					.where(eq(objects.ownerId, userId))
			)
	}

	async findByIdOrThrow(id: number) {
		const result = await this.db
				.select()
				.from(objects)
				.where(eq(objects.id, id))
		if (result.length === 0) {
			throw new NotFoundException(`Object ${id} not found`)
		}
		return (result[0])
	}

	create(userId: number, dto: CreateObjectDto) {
			return (this.db
					.insert(objects)
					.values({
							...dto,
							ownerId: userId
					})
					.returning()
			)
	}

	update(id: number, userId: number, dto: UpdateObjectDto) {
			return (this.db
					.update(objects)
					.set(dto)
					.where(
							and(
									eq(objects.id, id),
									eq(objects.ownerId, userId)
							)
					)       
					.returning()
			)       
	}

	remove(id: number, userId: number) {
			return (this.db
					.delete(objects)
					.where(
							and(
									eq(objects.id, id),
									eq(objects.ownerId, userId)
							)
					)
			)
	}

	async removeAllByOwner(ownerId: number): Promise<number> {
		const deleted = await this.db
			.delete(objects)
			.where(eq(objects.ownerId, ownerId))
			.returning({ id: objects.id })
		return (deleted.length)
	}
}