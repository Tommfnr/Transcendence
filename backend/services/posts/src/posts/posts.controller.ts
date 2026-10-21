import { Controller, Get, Post, Put, Delete, UseGuards, Param, Body } from '@nestjs/common'
import { CurrentUser, SharedAuthGuard, ParseIdPipe } from '@pep/shared'
import { PostsService } from './posts.service'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { PostOwnerGuard } from './guards/post-owner.guard'
import { PostGroupGuard } from './guards/post-group.guard'


@Controller('posts')
@UseGuards(SharedAuthGuard)
export class PostsController {
	constructor(private readonly postsService: PostsService) { }

	@Get('my')
	findMy(@CurrentUser('sub') userId: number) {
		return (this.postsService.findByUserId(userId))
	}

	@Get('my-groups')
	findFromMyGroups(@CurrentUser('sub') userId: number) {
		return (this.postsService.findFromMyGroups(userId))
	}

	// Declared before ':postId' so "stats" is not parsed as an id
	@Get('stats')
	stats(@CurrentUser('sub') userId: number) {
		return (this.postsService.stats(userId))
	}

	@Get(':postId')
	@UseGuards(PostGroupGuard)
	findOne(@Param('postId', ParseIdPipe) postId: number) {
		return (this.postsService.findOne(postId))
	}

	@Get(':postId/groups')
	@UseGuards(PostGroupGuard)
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
