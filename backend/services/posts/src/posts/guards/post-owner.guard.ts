import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { and, eq, isNull } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { posts } from '../../database/schema'
import { DB } from '../../database/database.module'
import { parseId } from '@pep/shared'

@Injectable()
export class PostOwnerGuard implements CanActivate {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const postId = parseId(req.params.postId)

		const [post] = await this.db
			.select()
			.from(posts)
			.where(and(eq(posts.id, postId), isNull(posts.deletedAt)))

		if (!post)
			throw new NotFoundException('Post not found')
		if (post.ownerId !== req.user.sub)
			throw new ForbiddenException('Only the post owner can do this action')

		return (true)
	}
}
