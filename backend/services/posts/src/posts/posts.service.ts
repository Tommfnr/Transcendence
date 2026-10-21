import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { EVENT, makeEvent } from '@pep/shared'
import { posts, postGroups, objectTypeEnum } from '../database/schema'
import { DB } from '../database/database.module'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { GroupsProxyService } from './groups-proxy.service'
import { EventPublisherService } from '../events/event-publisher.service'

@Injectable()
export class PostsService {
	constructor(
		@Inject(DB) private db: PostgresJsDatabase,
		private readonly groupsProxy: GroupsProxyService,
		private readonly eventPublisher: EventPublisherService,
	) { }

	findByUserId(userId: number) {
		return (this.db
			.select()
			.from(posts)
			.where(and(eq(posts.ownerId, userId), isNull(posts.deletedAt)))
		)
	}
	
	async stats(userId: number) {
		const myPosts = await this.findByUserId(userId)

		const total = myPosts.length
		const open = myPosts.filter((post) => post.status === 'open').length
		const closed = total - open

		let topCategory: string | null = null
		let topCount = 0
		for (const category of objectTypeEnum.enumValues) {
			const count = myPosts.filter((post) => post.objectType === category).length
			if (count > topCount) {
				topCategory = category
				topCount = count
			}
		}

		return ({ total, open, closed, topCategory })
	}

	async findOne(postId: number) {
		const [post] = await this.db.select().from(posts).where(eq(posts.id, postId))

		if (!post)
			throw new NotFoundException('Post not found')

		return (post)
	}

	async findGroupIds(postId: number) {
		const rows = await this.db
			.select({ groupId: postGroups.groupId })
			.from(postGroups)
			.where(eq(postGroups.postId, postId))

		return (rows.map((row) => row.groupId))
	}

	async findGroups(postId: number) {
		const groupIds = await this.findGroupIds(postId)

		if (groupIds.length === 0)
			return ([])

		return (this.groupsProxy.findByIds(groupIds))
	}

	async findFromMyGroups(userId: number) {
		const groupIds = await this.groupsProxy.findIdsForUser(userId)

		if (groupIds.length === 0)
			return ([])

		const postIdsInMyGroups = this.db
			.select({ id: postGroups.postId })
			.from(postGroups)
			.where(inArray(postGroups.groupId, groupIds))

		return (this.db
			.select()
			.from(posts)
			.where(and(inArray(posts.id, postIdsInMyGroups), isNull(posts.deletedAt)))
			.orderBy(posts.id))
	}


	async create(userId: number, dto: CreatePostDto) {
		const { groupIds: rawGroupIds, ...postFields } = dto
		const groupIds = [...new Set(rawGroupIds)]

		const isMember = await this.groupsProxy.isMemberOfAll(userId, groupIds)

		if (!isMember)
			throw new ForbiddenException('You can only post to groups you belong to')

		return (this.db.transaction(async (t) => {
			const [post] = await t
				.insert(posts)
				.values({ ...postFields, ownerId: userId })
				.returning()

			await t.insert(postGroups).values(
				groupIds.map((groupId) => ({ postId: post.id, groupId }))
			)

			return (post)
		}))
	}

	async update(postId: number, userId: number, dto: UpdatePostDto) {
		const { groupIds: rawGroupIds, ...postFields } = dto

		let groupIds: number[] | undefined
		if (rawGroupIds)
			groupIds = [...new Set(rawGroupIds)]

		let post = await this.findOne(postId)

		const fromDate = postFields.fromDate ?? post.fromDate
		const toDate = postFields.toDate ?? post.toDate

		if (toDate <= fromDate) {
			throw new BadRequestException({
				statusCode: 400,
				message: 'Validation failed',
				errors: { toDate: ['End date must be after the start date'] },
				formErrors: [],
			})
		}

		const startOfToday = new Date()
		startOfToday.setUTCHours(0, 0, 0, 0)

		const fromDateChanged = fromDate.getTime() !== new Date(post.fromDate).getTime()
		if (fromDateChanged && fromDate < startOfToday) {
			throw new BadRequestException({
				statusCode: 400,
				message: 'Validation failed',
				errors: { fromDate: ['Start date cannot be in the past'] },
				formErrors: [],
			})
		}

		if (groupIds) {
			const isMember = await this.groupsProxy.isMemberOfAll(userId, groupIds)

			if (!isMember)
				throw new ForbiddenException('You can only post to groups you belong to')
		}

		return (this.db.transaction(async (t) => {
			if (Object.keys(postFields).length > 0) {
				[post] = await t
					.update(posts)
					.set({ ...postFields, updatedAt: new Date() })
					.where(eq(posts.id, postId))
					.returning()
			}

			if (groupIds) {
				await t.delete(postGroups).where(eq(postGroups.postId, postId))
				await t.insert(postGroups).values(
					groupIds.map((groupId) => ({ postId, groupId }))
				)

				if (Object.keys(postFields).length === 0) {
					;[post] = await t
						.update(posts)
						.set({ updatedAt: new Date() })
						.where(eq(posts.id, postId))
						.returning()
				}
			}

			return (post)
		}))
	}

	async closeInternal(postId: number) {
		await this.db
			.update(posts)
			.set({ status: 'closed', updatedAt: new Date() })
			.where(eq(posts.id, postId))
	}

	async remove(postId: number) {
		await this.db
			.update(posts)
			.set({ deletedAt: new Date(), status: 'closed', updatedAt: new Date() })
			.where(eq(posts.id, postId))

		await this.eventPublisher.publish(makeEvent(EVENT.PostDeleted, 'posts', { postId }))

		return ({ message: 'Post successfully deleted' })
	}

	async updateAllByOwnerDeleted(ownerId: number): Promise<number> {
		const updated = await this.db
			.update(posts)
			.set({ deletedAt: new Date(), status: 'closed', updatedAt: new Date() })
			.where(and(eq(posts.ownerId, ownerId), isNull(posts.deletedAt)))
			.returning({ id: posts.id })

		return (updated.length)
	}
}
