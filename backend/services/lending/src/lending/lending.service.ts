import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DB } from '../database/database.module'
import { and, desc, eq, or } from 'drizzle-orm'
import { lending } from '../database/schema'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { ObjectsProxyService } from './objects-proxy.service'

@Injectable()
export class LendingService {
	constructor(
		@Inject(DB) private db : PostgresJsDatabase,
		private readonly objectsProxy: ObjectsProxyService,
	) {}

	async listAll(userId: number) {
		return (this.db
			.select()
			.from(lending)
			.where(or(eq(lending.lenderId, userId), eq(lending.borrowerId, userId)))
			.orderBy(desc(lending.createdAt)))
	}

	async newTransaction(dto: CreateTransactionDto, userId: number) {
		const object = await this.objectsProxy.findById(dto.objectId)

		if (!object.isAvailable)
			throw new ConflictException('Object not available')

		try {
			return (await this.db.insert(lending).values({
				objectId: dto.objectId,
				lenderId: object.ownerId,
				borrowerId: userId,
				status: 'pending',
				lendedFrom: new Date(dto.lendedFrom),
				lendedTo: new Date(dto.lendedTo),
			}).returning())
		} catch (err: unknown) {
			if (err && typeof err === 'object' && 'code' in err && err.code === '23P01') // exclusion_violation, no overlap constraint
				throw new ConflictException('Object already booked for that period')
			throw err
		}
	}

	async removeForUser(userId: number): Promise<number> {
		const deleted = await this.db
			.delete(lending)
			.where(or(eq(lending.lenderId, userId), eq(lending.borrowerId, userId)))
			.returning({ id: lending.id })

		return (deleted.length)
	}

	async findOne(id: number, userId: number) {
		const [t] = await this.db.select().from(lending).where(eq(lending.id, id))

		if (!t || (t.lenderId !== userId && t.borrowerId !== userId))
			throw new NotFoundException()
		return (t)
	}

	async acceptLend(id: number, userId: number) {
		const [t] = await this.db.select().from(lending).where(eq(lending.id, id))

		if (!t || (t.lenderId !== userId && t.borrowerId !== userId))
			throw new NotFoundException()
		if (t.lenderId !== userId)
			throw new ForbiddenException('Only the lender can accept a lending request')

		const [updated] = await this.db
			.update(lending)
			.set({ status: 'accepted', updatedAt: new Date() })
			.where(and(eq(lending.id, id), eq(lending.lenderId, userId)))
			.returning()

		if (!updated)
			throw new NotFoundException()
		return (updated)
	}
}
