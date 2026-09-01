import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase, PostgresJsTransaction } from 'drizzle-orm/postgres-js'
import { posts, postGroups, groups } from '../database/schema'
import { DB } from '../database/database.module'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { GroupsService } from '../groups/groups.service'

type Executor = PostgresJsDatabase | PostgresJsTransaction<Record<string, never>, Record<string, never>>

@Injectable()
export class PostsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase, private readonly groupsService: GroupsService) {}

	private async findAuthorizedPost(executor: Executor, postId: number, userId: number, action: string) {
		const [post] = await executor.select().from(posts).where(eq(posts.id, postId))

		if (!post)
			throw new NotFoundException('Post not found')
		if (post.ownerId !== userId)
			throw new ForbiddenException(`Only the post owner can ${action} this post`)

		return post
	}

	findAll() {
		return this.db.select().from(posts).orderBy(posts.id)
	}

	findByUserId(userId: number) {
		return this.db
				.select()
				.from(posts)
				.where(eq(posts.ownerId, userId))
	}

	async findOne(postId: number) {
		const [post] = await this.db.select().from(posts).where(eq(posts.id, postId))

		if (!post)
			throw new NotFoundException('Post not found')

		return post
	}

	findGroups(postId: number) {
		return this.db
				.select({ id: groups.id, name: groups.name })
				.from(postGroups)
				.innerJoin(groups, eq(postGroups.groupId, groups.id))
				.where(eq(postGroups.postId, postId))
	}

	async create(userId: number, dto: CreatePostDto) {
		return this.db.transaction(async (t) => {
			const { groupIds: rawGroupIds, ...postFields } = dto
			const groupIds = [...new Set(rawGroupIds)]

			const isMember = await this.groupsService.isMemberOfAll(userId, groupIds)

			if (!isMember)
				throw new ForbiddenException('You can only post to groups you belong to')

			const [post] = await t
					.insert(posts)
					.values({ ...postFields, ownerId: userId })
					.returning()

			await t.insert(postGroups).values(
				groupIds.map((groupId) => ({ postId: post.id, groupId }))
			)

			return post
		})
	}

	async update(postId: number, userId: number, dto: UpdatePostDto) {
		const { groupIds: rawGroupIds, ...postFields } = dto

		let groupIds: number[] | undefined
		if (rawGroupIds)
			groupIds = [...new Set(rawGroupIds)]

		return this.db.transaction(async (t) => {
			const existing = await this.findAuthorizedPost(t, postId, userId, 'update')

			if (groupIds) {
				const isMember = await this.groupsService.isMemberOfAll(userId, groupIds)

				if (!isMember)
					throw new ForbiddenException('You can only post to groups you belong to')
			}

			let post = existing

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

			return post
		})
	}

	async remove(postId: number, userId: number) {
		await this.findAuthorizedPost(this.db, postId, userId, 'delete')

		await this.db.delete(posts).where(eq(posts.id, postId))

		return { message: 'Post successfully deleted' }
	}
}
