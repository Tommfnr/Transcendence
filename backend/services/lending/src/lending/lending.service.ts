import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DB } from '../database/database.module'
import { and, count, desc, eq, gt, inArray, lt, or, sql } from 'drizzle-orm'
import { pgErrorCode } from '@pep/shared'
import { lending } from '../database/schema'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { ObjectsProxyService } from './objects-proxy.service'
import { PostsProxyService } from './posts-proxy.service'
import { GroupsProxyService } from './groups-proxy.service'

const BOOKED_STATUSES = ['accepted', 'active', 'awaiting_confirmation', 'overdue'] as const
const OBJECT_LOCK_NAMESPACE = 1

@Injectable()
export class LendingService {
	private readonly logger = new Logger(LendingService.name)

	constructor(
		@Inject(DB) private db: PostgresJsDatabase,
		private readonly objectsProxy: ObjectsProxyService,
		private readonly postsProxy: PostsProxyService,
		private readonly groupsProxy: GroupsProxyService,
	) { }

	async stats(userId: number) {
		const myLendings = await this.db
			.select()
			.from(lending)
			.where(or(eq(lending.lenderId, userId), eq(lending.borrowerId, userId)))

		const happenedStatuses: string[] = ['accepted', 'active', 'awaiting_confirmation', 'overdue', 'returned', 'disputed']

		const lent = myLendings.filter((loan) =>
			loan.lenderId === userId && happenedStatuses.includes(loan.status)).length

		const borrowed = myLendings.filter((loan) =>
			loan.borrowerId === userId && happenedStatuses.includes(loan.status)).length

		const requestsAnswered = myLendings.filter((loan) => loan.lenderId === userId).length

		return ({ lent, borrowed, requestsAnswered })
	}

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
			if (post.ownerId === userId)
				throw new BadRequestException('You cannot offer help on your own post')
			if (new Date(dto.lendedFrom) < new Date(post.fromDate) || new Date(dto.lendedTo) > new Date(post.toDate))
				throw new BadRequestException('Offer window must fit inside the post window')
			if (!(await this.groupsProxy.sharesGroup([userId], post.groupIds)))
				throw new ForbiddenException('You can only offer help on posts of your groups')

			lenderId = userId
			borrowerId = post.ownerId
		} else {
			if (object.ownerId === userId)
				throw new BadRequestException('You cannot borrow your own object')
			if (!(await this.groupsProxy.sharesGroup([userId, object.ownerId])))
				throw new ForbiddenException('You can only borrow from members of your groups')

			lenderId = object.ownerId
			borrowerId = userId
		}

		const lendedFrom = new Date(dto.lendedFrom)
		const lendedTo = new Date(dto.lendedTo)

		try {
			return (await this.db.transaction(async (t) => {
				await this.lockObject(t, dto.objectId)

				const [booked] = await t
					.select({ id: lending.id })
					.from(lending)
					.where(and(
						eq(lending.objectId, dto.objectId),
						inArray(lending.status, [...BOOKED_STATUSES]),
						lt(lending.lendedFrom, lendedTo),
						gt(lending.lendedTo, lendedFrom),
					))
					.limit(1)

				if (booked)
					throw new ConflictException('Object already booked for that period')

				return (await t.insert(lending).values({
					objectId: dto.objectId,
					postId: dto.postId,
					lenderId,
					borrowerId,
					status: 'pending',
					lendedFrom,
					lendedTo,
					message: dto.message,
				}).returning())
			}))
		} catch (err: unknown) {
			const wrappedCause = err instanceof Error ? (err as { cause?: unknown }).cause : undefined
			const cause = wrappedCause instanceof Error ? wrappedCause : err

			if (cause instanceof Error && 'constraint_name' in cause && cause.constraint_name === 'no_duplicate_pending')
				throw new ConflictException('You already have a pending request for that period')
			if (cause instanceof Error && 'code' in cause && cause.code === '23P01') // exclusion_violation, no overlap constraint
				throw new ConflictException('Object already booked for that period')
			if (cause instanceof Error && 'code' in cause && cause.code === '23503')
				throw new UnauthorizedException('User no longer exists')
			throw err
		}
	}

	async updateAllForUserDeleted(userId: number): Promise<number> {
		const cancelled = await this.db
			.update(lending)
			.set({ status: 'cancelled', updatedAt: new Date() })
			.where(and(
				or(eq(lending.lenderId, userId), eq(lending.borrowerId, userId)),
				inArray(lending.status, ['pending', ...BOOKED_STATUSES]),
			))
			.returning({ id: lending.id })

		return (cancelled.length)
	}

	async updateAllForObjectDeleted(objectId: number): Promise<number> {
		const cancelled = await this.db
			.update(lending)
			.set({ status: 'cancelled', updatedAt: new Date() })
			.where(and(
				eq(lending.objectId, objectId),
				inArray(lending.status, ['pending', 'accepted']),
			))
			.returning({ id: lending.id })

		return (cancelled.length)
	}

	async updateAllForPostDeleted(postId: number): Promise<number> {
		const cancelled = await this.db
			.update(lending)
			.set({ status: 'cancelled', updatedAt: new Date() })
			.where(and(
				eq(lending.postId, postId),
				inArray(lending.status, ['pending', 'accepted']),
			))
			.returning({ id: lending.id })

		return (cancelled.length)
	}

	async countForPost(postId: number) {
		const [row] = await this.db
			.select({ count: count() })
			.from(lending)
			.where(and(eq(lending.postId, postId), inArray(lending.status, ['pending', 'accepted'])))
		return { count: row.count }
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
		const objectId = t.objectId

		await this.assertStillAcceptable(t)

		const updated = await this.db.transaction(async (t) => {
			await this.lockObject(t, objectId)
			await t
				.select({ id: lending.id })
				.from(lending)
				.where(postId ? or(eq(lending.objectId, objectId), eq(lending.postId, postId)) : eq(lending.objectId, objectId))
				.orderBy(lending.id)
				.for('update')

			let accepted
			try {
				[accepted] = await t
					.update(lending)
					.set({ status: 'accepted', updatedAt: new Date() })
					.where(and(eq(lending.id, id), eq(lending.status, 'pending')))
					.returning()
			} catch (err: unknown) {
				if (pgErrorCode(err) === '23P01')
					throw new ConflictException('Object already booked for that period')
				throw err
			}

			if (!accepted)
				return (null)

			await t
				.update(lending)
				.set({ status: 'rejected', updatedAt: new Date() })
				.where(and(
					eq(lending.objectId, accepted.objectId),
					eq(lending.status, 'pending'),
					lt(lending.lendedFrom, accepted.lendedTo),
					gt(lending.lendedTo, accepted.lendedFrom),
				))

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
			await this.closePost(updated.postId)

		return (updated)
	}

	private async closePost(postId: number) {
		try {
			await this.postsProxy.close(postId)
		} catch (err: unknown) {
			this.logger.error(`could not close post ${postId}, loan already accepted: ${(err as Error).message}`)
		}
	}

	private async assertStillAcceptable(request: typeof lending.$inferSelect) {
		if (request.status !== 'pending')
			throw new ConflictException('Request is no longer pending')
		if (request.lendedTo <= new Date())
			throw new ConflictException('Requested period is already over')

		let object
		try {
			object = await this.objectsProxy.findById(request.objectId)
		} catch (err: unknown) {
			if (err instanceof NotFoundException)
				throw new ConflictException('Object no longer exists')
			throw err
		}
		if (!object.isAvailable)
			throw new ConflictException('Object not available')

		if (!request.postId)
			return

		let post
		try {
			post = await this.postsProxy.findById(request.postId)
		} catch (err: unknown) {
			if (err instanceof NotFoundException)
				throw new ConflictException('Post no longer exists')
			throw err
		}
		if (post.status !== 'open')
			throw new ConflictException('Post is no longer open')
		if (request.lendedFrom < new Date(post.fromDate) || request.lendedTo > new Date(post.toDate))
			throw new ConflictException('Requested period no longer fits inside the post window')
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

	async cancelLend(id: number, userId: number) {
		const [t] = await this.db.select().from(lending).where(eq(lending.id, id))

		if (!t || (t.lenderId !== userId && t.borrowerId !== userId))
			throw new NotFoundException()

		if (this.approverFor(t) === userId)
			throw new ForbiddenException('Only the requester can cancel this request')

		const [updated] = await this.db
			.update(lending)
			.set({ status: 'cancelled', updatedAt: new Date() })
			.where(and(eq(lending.id, id), eq(lending.status, 'pending')))
			.returning()

		if (!updated)
			throw new NotFoundException()
		return (updated)
	}

	async returnLend(id: number, userId: number) {
		const [t] = await this.db.select().from(lending).where(eq(lending.id, id))

		if (!t || (t.lenderId !== userId && t.borrowerId !== userId))
			throw new NotFoundException()

		if (t.lenderId !== userId)
			throw new ForbiddenException('Only the lender can confirm the item is back')

		const [updated] = await this.db
			.update(lending)
			.set({ status: 'returned', lenderConfirmedReturnedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(lending.id, id), inArray(lending.status, [...BOOKED_STATUSES])))
			.returning()

		if (!updated)
			throw new ConflictException('This loan is not in progress')
		return (updated)
	}

	private async lockObject(t: Pick<PostgresJsDatabase, 'execute'>, objectId: number) {
		await t.execute(sql`select pg_advisory_xact_lock(${OBJECT_LOCK_NAMESPACE}::int, ${objectId}::int)`)
	}

	private approverFor(t: { postId: number | null, lenderId: number, borrowerId: number }): number {
		return (t.postId ? t.borrowerId : t.lenderId)
	}
}
