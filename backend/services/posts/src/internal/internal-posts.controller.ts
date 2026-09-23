import { Controller, Get, HttpCode, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common'
import { InternalAuthGuard, PostView } from '@pep/shared'
import { PostsService } from '../posts/posts.service'

@UseGuards(InternalAuthGuard)
@Controller('internal/posts')
export class InternalPostsController {
	constructor(private readonly postsService: PostsService) {}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostView> {
		const post = await this.postsService.findOne(id)

		return ({ id: post.id, ownerId: post.ownerId, status: post.status })
	}

	@Put(':id/close')
	@HttpCode(204)
	async close(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.postsService.closeInternal(id)
	}
}
