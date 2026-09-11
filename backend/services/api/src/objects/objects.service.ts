// Service files defines the functions used in backend
// See : https://docs.nestjs.com/providers#services

import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase, PostgresJsTransaction } from 'drizzle-orm/postgres-js'
import { objects } from '../database/schema'
import { DB } from '../database/database.module'
import { CreateObjectDto } from './dto/create-object.dto'
import { UpdateObjectDto } from './dto/update-object.dto'

type Executor = PostgresJsDatabase | PostgresJsTransaction<Record<string, never>, Record<string, never>>

@Injectable()
export class ObjectsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	private async findAuthorizedObject(executor: Executor, objectId: number, userId: number, action: string) {
		const [object] = await executor
				.select()
				.from(objects)
				.where(eq(objects.id, objectId))

		if (!object)
			throw new NotFoundException(`Object ${objectId} not found`)
		if (object.ownerId !== userId)
			throw new ForbiddenException(`Only the object owner can ${action} this object`)

		return object
	}

	findAll() {
		return this.db
				.select()
				.from(objects)
				.orderBy(objects.id)
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

	async update(objectId: number, userId: number, dto: UpdateObjectDto) {
		return this.db.transaction(async (t) => {
			await this.findAuthorizedObject(t, objectId, userId, 'update')

			return t
					.update(objects)
					.set(dto)
					.where(eq(objects.id, objectId))
					.returning()
		})
	}

	async remove(objectId: number, userId: number) {
		return this.db.transaction(async (t) => {
			await this.findAuthorizedObject(t, objectId, userId, 'delete')

			return t
					.delete(objects)
					.where(eq(objects.id, objectId))
		})
	}
}
