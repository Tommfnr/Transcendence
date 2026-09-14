import { Controller, Get, Post, Put, Delete, UseGuards, Param, Req, Body } from '@nestjs/common'
import { PostsService } from './posts.service'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { AuthGuard } from '../auth/guard'
import { AuthenticatedRequest } from '../auth/types/authenticated-request'
import { PostOwnerGuard } from './guards/post-owner.guard'

@Controller('posts')
@UseGuards(AuthGuard)
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Get()
	findAll() {
		return this.postsService.findAll()
	}

	@Get('my')
	findMy(@Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.postsService.findByUserId(userId)
	}

	@Get(':postId')
	findOne(@Param('postId') postId: string) {
		return this.postsService.findOne(Number(postId))
	}

	@Get(':postId/groups')
	findGroups(@Param('postId') postId: string) {
		return this.postsService.findGroups(Number(postId))
	}

	@Post()
	create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePostDto) {
		const userId = req.user.sub
		return this.postsService.create(userId, dto)
	}

	@Put(':postId')
	@UseGuards(PostOwnerGuard)
	update(@Param('postId') postId: string, @Req() req: AuthenticatedRequest, @Body() dto: UpdatePostDto) {
		const userId = req.user.sub
		return this.postsService.update(Number(postId), userId, dto)
	}

	@Delete(':postId')
	@UseGuards(PostOwnerGuard)
	remove(@Param('postId') postId: string) {
		return this.postsService.remove(Number(postId))
	}
}
