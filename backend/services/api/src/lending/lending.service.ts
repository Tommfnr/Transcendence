import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DB } from '../database/database.module'
import { lending } from '../database/schema'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { ObjectsService } from 'src/objects/objects.service'

@Injectable()
export class LendingService {
	constructor(@Inject(DB) private db : PostgresJsDatabase,
							private readonly objectsService: ObjectsService) {}

	async newTransaction(dto: CreateTransactionDto, userId: number) {
		const object = await this.objectsService.findByIdOrThrow(dto.objectId)

		if (!object)
				throw new BadRequestException('Error with object')
		
		const from = new Date(dto.lendedFrom)
		const to = new Date(dto.lendedTo)

		if (to <= from)
			throw new BadRequestException('Impossible dates')
		
		try {
			return (await this.db.insert(lending).values({
				objectId: dto.objectId,
				lenderId: object.ownerId,
				borrowerId: userId,
				status: 'pending',
				lendedFrom: from,
				lendedTo: to,
			}).returning())
		} catch (err: any) {
			// if (alreadybooked)
			if (err.code === '23P01') // exclusion_violation, no overlap constraint
				throw new ConflictException('Object already booked for that period')
			throw err
		}
	}

}