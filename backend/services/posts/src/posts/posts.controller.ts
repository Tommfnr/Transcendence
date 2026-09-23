import { Controller, Get, Post, Put, Delete, UseGuards, Param, Body } from '@nestjs/common'
import { CurrentUser, SharedAuthGuard, ParseIdPipe } from '@pep/shared'
import { PostsService } from './posts.service'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { PostOwnerGuard } from './guards/post-owner.guard'

@Controller('posts')
@UseGuards(SharedAuthGuard)
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Get()
	findAll() {
		return (this.postsService.findAll())
	}

	@Get('my')
	findMy(@CurrentUser('sub') userId: number) {
		return (this.postsService.findByUserId(userId))
	}

	@Get(':postId')
	findOne(@Param('postId', ParseIdPipe) postId: number) {
		return (this.postsService.findOne(postId))
	}

	@Get(':postId/groups')
	findGroups(@Param('postId', ParseIdPipe) postId: number) {
		return (this.postsService.findGroups(postId))
	}

	@Post()
	create(@CurrentUser('sub') userId: number, @Body() dto: CreatePostDto) {
		return (this.postsService.create(userId, dto))
	}

	@Put(':postId')
	@UseGuards(PostOwnerGuard)
	update(@Param('postId', ParseIdPipe) postId: number, @CurrentUser('sub') userId: number, @Body() dto: UpdatePostDto) {
		return (this.postsService.update(postId, userId, dto))
	}

	@Delete(':postId')
	@UseGuards(PostOwnerGuard)
	remove(@Param('postId', ParseIdPipe) postId: number) {
		return (this.postsService.remove(postId))
	}
}
