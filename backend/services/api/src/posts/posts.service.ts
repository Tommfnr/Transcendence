import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
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

	findOne(id: number) {
		return (this.db
				.select()
				.from(posts)
				.where(eq(posts.id, id)))
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
			const memberships = await t
					.select({ groupId: groupMembers.groupId })
					.from(groupMembers)
					.where(and(eq(groupMembers.userId, userId), inArray(groupMembers.groupId, dto.groupIds)))

			if (memberships.length !== dto.groupIds.length)
				throw new ForbiddenException('You can only post to groups you belong to')

			const { groupIds, ...postFields } = dto

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
		const { groupIds, ...postFields } = dto

		return (this.db.transaction(async (t) => {
			if (groupIds) {
				const memberships = await t
						.select({ groupId: groupMembers.groupId })
						.from(groupMembers)
						.where(and(eq(groupMembers.userId, userId), inArray(groupMembers.groupId, groupIds)))

				if (memberships.length !== groupIds.length)
					throw new ForbiddenException('You can only post to groups you belong to')
			}

			let post

			if (Object.keys(postFields).length > 0) {
				[post] = await t
						.update(posts)
						.set(postFields)
						.where(and(eq(posts.id, id), eq(posts.ownerId, userId)))
						.returning()
			} else {
				[post] = await t
						.select()
						.from(posts)
						.where(and(eq(posts.id, id), eq(posts.ownerId, userId)))
			}

			if (!post)
				return (undefined)

			if (groupIds) {
				await t.delete(postGroups).where(eq(postGroups.postId, id))
				await t.insert(postGroups).values(
					groupIds.map((groupId) => ({ postId: id, groupId }))
				)
			}

			return (post)
		}))
	}

	remove(id: number, userId: number) {
		return (this.db
				.delete(posts)
				.where(and(eq(posts.id, id), eq(posts.ownerId, userId))))
	}
}
