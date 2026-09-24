import { Controller, Get, HttpCode, Param, Put, UseGuards } from '@nestjs/common'
import { InternalAuthGuard, PostView, ParseIdPipe } from '@pep/shared'
import { PostsService } from '../posts/posts.service'

@UseGuards(InternalAuthGuard)
@Controller('internal/posts')
export class InternalPostsController {
	constructor(private readonly postsService: PostsService) {}

	@Get(':id')
	async findOne(@Param('id', ParseIdPipe) id: number): Promise<PostView> {
		const post = await this.postsService.findOne(id)
		const groupIds = await this.postsService.findGroupIds(id)

		return ({ id: post.id, ownerId: post.ownerId, status: post.status, groupIds })
	}

	@Put(':id/close')
	@HttpCode(204)
	async close(@Param('id', ParseIdPipe) id: number): Promise<void> {
		await this.postsService.closeInternal(id)
	}
}
