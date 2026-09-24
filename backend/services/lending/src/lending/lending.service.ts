import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DB } from '../database/database.module'
import { and, desc, eq, or } from 'drizzle-orm'
import { lending } from '../database/schema'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { ObjectsProxyService } from './objects-proxy.service'
import { PostsProxyService } from './posts-proxy.service'

@Injectable()
export class LendingService {
	constructor(
		@Inject(DB) private db : PostgresJsDatabase,
		private readonly objectsProxy: ObjectsProxyService,
		private readonly postsProxy: PostsProxyService,
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

		let lenderId: number
		let borrowerId: number

		if (dto.postId) {
			const post = await this.postsProxy.findById(dto.postId)

			if (post.status !== 'open')
				throw new ConflictException('Post is no longer open')
			if (object.ownerId !== userId)
				throw new ForbiddenException('You can only offer your own objects')

			lenderId = userId
			borrowerId = post.ownerId
		} else {
			lenderId = object.ownerId
			borrowerId = userId
		}

		try {
			return (await this.db.insert(lending).values({
				objectId: dto.objectId,
				postId: dto.postId,
				lenderId,
				borrowerId,
				status: 'pending',
				lendedFrom: new Date(dto.lendedFrom),
				lendedTo: new Date(dto.lendedTo),
				message: dto.message,
			}).returning())
		} catch (err: unknown) {
			const wrappedCause = err instanceof Error ? (err as { cause?: unknown }).cause : undefined
			const cause = wrappedCause instanceof Error ? wrappedCause : err

			if (cause instanceof Error && 'code' in cause && cause.code === '23P01') // exclusion_violation, no overlap constraint
				throw new ConflictException('Object already booked for that period')
			if (cause instanceof Error && 'code' in cause && cause.code === '23503')
				throw new UnauthorizedException('User no longer exists')
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

		const approverId = this.approverFor(t)

		if (approverId !== userId)
			throw new ForbiddenException('Only the other party can accept this request')

		const postId = t.postId

		const updated = await this.db.transaction(async (t) => {
			if (postId) {
				await t
					.select({ id: lending.id })
					.from(lending)
					.where(eq(lending.postId, postId))
					.orderBy(lending.id)
					.for('update')
			}

			const [accepted] = await t
				.update(lending)
				.set({ status: 'accepted', updatedAt: new Date() })
				.where(and(eq(lending.id, id), eq(lending.status, 'pending')))
				.returning()

			if (!accepted)
				return (null)

			if (accepted.postId) {
				await t
					.update(lending)
					.set({ status: 'rejected', updatedAt: new Date() })
					.where(and(
						eq(lending.postId, accepted.postId),
						eq(lending.status, 'pending'),
					))
			}

			return (accepted)
		})

		if (!updated)
			throw new NotFoundException()

		if (updated.postId)
			await this.postsProxy.close(updated.postId)

		return (updated)
	}

	async rejectLend(id: number, userId: number) {
		const [t] = await this.db.select().from(lending).where(eq(lending.id, id))

		if (!t || (t.lenderId !== userId && t.borrowerId !== userId))
			throw new NotFoundException()

		const approverId = this.approverFor(t)

		if (approverId !== userId)
			throw new ForbiddenException('Only the other party can reject this request')

		const [updated] = await this.db
			.update(lending)
			.set({ status: 'rejected', updatedAt: new Date() })
			.where(and(eq(lending.id, id), eq(lending.status, 'pending')))
			.returning()

		if (!updated)
			throw new NotFoundException()
		return (updated)
	}

	private approverFor(t: { postId: number | null, lenderId: number, borrowerId: number }): number {
		return (t.postId ? t.borrowerId : t.lenderId)
	}
}
