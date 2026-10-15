// Service files defines the functions used in backend
// See : https://docs.nestjs.com/providers#services

import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { EVENT, makeEvent, pgErrorCode } from '@pep/shared'
import { and, eq, isNull } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { objects } from '../database/schema'
import { DB } from '../database/database.module'
import { CreateObjectDto } from './dto/create-object.dto'
import { UpdateObjectDto } from './dto/update-object.dto'
import { EventPublisherService } from '../events/event-publisher.service'

@Injectable()
export class ObjectsService {
	constructor(
		@Inject(DB) private db : PostgresJsDatabase,
		private readonly eventPublisher: EventPublisherService,
	) {}

	findAll() {
		return (this.db
				.select()
				.from(objects)
				.where(isNull(objects.deletedAt))
				.orderBy(objects.id))
	}

	async stats(userId: number) {
		const rows = await this.findByUserId(userId)

		return ({
			total: rows.length,
			available: rows.filter((object) => object.isAvailable).length,
		})
	}

	findByUserId(userId: number) {
		return (this.db
				.select()
				.from(objects)
				.where(and(eq(objects.ownerId, userId), isNull(objects.deletedAt)))
		)
	}

	async findByIdOrThrow(objectId: number) {
		const [object] = await this.db
				.select()
				.from(objects)
				.where(eq(objects.id, objectId))

		if (!object)
			throw new NotFoundException(`Object ${objectId} not found`)

		return (object)
	}

	async create(userId: number, dto: CreateObjectDto) {
		try {
			return (await this.db
					.insert(objects)
					.values({ ...dto, ownerId: userId })
					.returning())
		} catch (err: unknown) {
			if (pgErrorCode(err) === '23503')
				throw new UnauthorizedException('User no longer exists')
			throw err
		}
	}

	update(objectId: number, dto: UpdateObjectDto) {
		return (this.db
				.update(objects)
				.set({ ...dto, updatedAt: new Date() })
				.where(eq(objects.id, objectId))
				.returning())
	}

	async remove(objectId: number): Promise<void> {
		await this.db
				.update(objects)
				.set({ deletedAt: new Date(), isAvailable: false, updatedAt: new Date() })
				.where(eq(objects.id, objectId))

		await this.eventPublisher.publish(makeEvent(EVENT.ObjectDeleted, 'objects', { objectId }))
	}

	async updateAllByOwnerDeleted(ownerId: number): Promise<number> {
		const updated = await this.db
			.update(objects)
			.set({ isAvailable: false, updatedAt: new Date() })
			.where(eq(objects.ownerId, ownerId))
			.returning({ id: objects.id })
		return (updated.length)
	}
}
