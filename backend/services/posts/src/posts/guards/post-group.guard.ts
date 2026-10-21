import { CanActivate, ExecutionContext, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { and, eq, isNull } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { posts, postGroups } from '../../database/schema'
import { DB } from '../../database/database.module'
import { GroupsProxyService } from '../groups-proxy.service'
import { parseId } from '@pep/shared'

@Injectable()
export class PostGroupGuard implements CanActivate {
	constructor(@Inject(DB) private db : PostgresJsDatabase,
	private readonly groupsProxy: GroupsProxyService,
) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const postId = parseId(req.params.postId)
		const userId = req.user.sub

		const [post] = await this.db
			.select()
			.from(posts)
			.where(and(eq(posts.id, postId), isNull(posts.deletedAt)))

		if (!post)
			throw new NotFoundException('Post not found')
		if (post.ownerId === userId)
			return (true)

		const postGroupRows = await this.db
			.select({ groupId: postGroups.groupId })
			.from(postGroups)
			.where(eq(postGroups.postId, postId))

		const postGroupsIds = postGroupRows.map((row) => row.groupId)
		const myGroupIds = await this.groupsProxy.findIdsForUser(userId)
		const sharesOneGroup = postGroupsIds.some((groupId) => myGroupIds.includes(groupId))

		if (!sharesOneGroup)
			throw new NotFoundException('Post not found')

		return (true)
	}
}
