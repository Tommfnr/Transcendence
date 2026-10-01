import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { posts } from '../../database/schema'
import { DB } from '../../database/database.module'

@Injectable()
export class PostOwnerGuard implements CanActivate {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const postId = Number(req.params.postId)

		const [post] = await this.db
			.select()
			.from(posts)
			.where(eq(posts.id, postId))

		if (!post)
			throw new NotFoundException('Post not found')
		if (post.ownerId !== req.user.sub)
			throw new ForbiddenException('Only the post owner can do this action')

		return (true)
	}
}
