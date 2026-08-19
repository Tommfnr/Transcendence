import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq, and, inArray } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { posts, postGroups, groupMembers, groups } from '../database/schema'
import { DB } from '../database/database.module'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'

@Injectable()
export class PostsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	findAll() {
		return (this.db.select().from(posts).orderBy(posts.id))
	}

	findByUserId(userId: number) {
		return (this.db
				.select()
				.from(posts)
				.where(eq(posts.ownerId, userId)))
	}

	async findOne(id: number) {
		const [post] = await this.db.select().from(posts).where(eq(posts.id, id))

		if (!post)
			throw new NotFoundException('Post not found')

		return (post)
	}

	findGroups(postId: number) {
		return (this.db
				.select({ id: groups.id, name: groups.name })
				.from(postGroups)
				.innerJoin(groups, eq(postGroups.groupId, groups.id))
				.where(eq(postGroups.postId, postId)))
	}

	async create(userId: number, dto: CreatePostDto) {
		return (this.db.transaction(async (t) => {
			const { groupIds: rawGroupIds, ...postFields } = dto
			const groupIds = [...new Set(rawGroupIds)]

			const memberships = await t
					.select({ groupId: groupMembers.groupId })
					.from(groupMembers)
					.where(and(eq(groupMembers.userId, userId), inArray(groupMembers.groupId, groupIds)))

			if (memberships.length !== groupIds.length)
				throw new ForbiddenException('You can only post to groups you belong to')

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

	async update(id: number, userId: number, dto: UpdatePostDto) {
		const { groupIds: rawGroupIds, ...postFields } = dto
		const groupIds = rawGroupIds ? [...new Set(rawGroupIds)] : undefined

		return (this.db.transaction(async (t) => {
			const [existing] = await t.select().from(posts).where(eq(posts.id, id))

			if (!existing)
				throw new NotFoundException('Post not found')
			if (existing.ownerId !== userId)
				throw new ForbiddenException('Only the post owner can update this post')

			if (groupIds) {
				const memberships = await t
						.select({ groupId: groupMembers.groupId })
						.from(groupMembers)
						.where(and(eq(groupMembers.userId, userId), inArray(groupMembers.groupId, groupIds)))

				if (memberships.length !== groupIds.length)
					throw new ForbiddenException('You can only post to groups you belong to')
			}

			let post = existing

			if (Object.keys(postFields).length > 0) {
				[post] = await t
						.update(posts)
						.set({ ...postFields, updatedAt: new Date() })
						.where(eq(posts.id, id))
						.returning()
			}

			if (groupIds) {
				await t.delete(postGroups).where(eq(postGroups.postId, id))
				await t.insert(postGroups).values(
					groupIds.map((groupId) => ({ postId: id, groupId }))
				)
			}

			return (post)
		}))
	}

	async remove(id: number, userId: number) {
		const [existing] = await this.db.select().from(posts).where(eq(posts.id, id))

		if (!existing)
			throw new NotFoundException('Post not found')
		if (existing.ownerId !== userId)
			throw new ForbiddenException('Only the post owner can delete this post')

		await this.db.delete(posts).where(eq(posts.id, id))

		return ({ message: 'Post successfully deleted' })
	}
}
