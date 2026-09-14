import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DB } from '../database/database.module'
import { desc, eq } from 'drizzle-orm'
import { lending } from '../database/schema'
import { CreateTransactionDto } from './dto/create-transaction.dto'

@Injectable()
export class LendingService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async listAll() {
		return (this.db.select().from(lending).orderBy(desc(lending.createdAt)))
	}

	async newTransaction(dto: CreateTransactionDto, userId: number) {
		try {
			return (await this.db.insert(lending).values({
				objectId: dto.objectId,
				lenderId: dto.lenderId,
				borrowerId: userId,
				status: 'pending',
				lendedFrom: new Date(dto.lendedFrom),
				lendedTo: new Date(dto.lendedTo),
			}).returning())
		} catch (err: any) {
			if (err.code === '23P01') // exclusion_violation, no overlap constraint
				throw new ConflictException('Object already booked for that period')
			throw err
		}
	}

	async findOne(id: number) {
		const [t] = await this.db.select().from(lending).where(eq(lending.id, id))

		if (!t)
			throw new NotFoundException()
		return (t)
	}

	async acceptLend(id: number) {
		const [updated] = await this.db.update(lending).set({ status: 'accepted', updatedAt: new Date() }).where(eq(lending.id, id)).returning()

		if (!updated)
			throw new NotFoundException()
		return (updated)
	}
}
