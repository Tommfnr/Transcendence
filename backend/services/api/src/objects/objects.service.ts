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
		return this.db.select().from(objects).orderBy(objects.id)
	}

	findByUserId(userId: number) {
		return this.db
				.select()
				.from(objects)
				.where(eq(objects.ownerId, userId))
	}

	async findByIdOrThrow(objectId: number) {
		const [object] = await this.db
				.select()
				.from(objects)
				.where(eq(objects.id, objectId))

		if (!object)
			throw new NotFoundException(`Object ${objectId} not found`)

		return object
	}

	create(userId: number, dto: CreateObjectDto) {
		return this.db
				.insert(objects)
				.values({ ...dto, ownerId: userId })
				.returning()
	}

	update(objectId: number, userId: number, dto: UpdateObjectDto) {
		return this.db
				.update(objects)
				.set(dto)
				.where(and(eq(objects.id, objectId), eq(objects.ownerId, userId)))
				.returning()
	}

	remove(objectId: number, userId: number) {
		return this.db
				.delete(objects)
				.where(and(eq(objects.id, objectId), eq(objects.ownerId, userId)))
	}
}
