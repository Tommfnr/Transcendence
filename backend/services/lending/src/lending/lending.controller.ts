import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common'
import { LendingService } from './lending.service'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { CurrentUser, SharedAuthGuard, ParseIdPipe } from '@pep/shared'

@UseGuards(SharedAuthGuard)
@Controller('lending')
export class LendingController {
	constructor(private readonly lendingService: LendingService) { }

	@Get()
	listAll(@CurrentUser('sub') userId: number) {
		return (this.lendingService.listAll(userId))
	}

	@Post()
	newTransaction(@Body() dto: CreateTransactionDto, @CurrentUser('sub') userId: number) {
		return (this.lendingService.newTransaction(dto, userId))
	}

	@Get('post/:postId/count')
	countForPost(@Param('postId', ParseIdPipe) postId: number) {
		return (this.lendingService.countForPost(postId))
	}

	@Get(':id')
	findOne(@Param('id', ParseIdPipe) id: number, @CurrentUser('sub') userId: number) {
		return (this.lendingService.findOne(id, userId))
	}

	@Patch(':id/accept')
	acceptLend(@Param('id', ParseIdPipe) id: number, @CurrentUser('sub') userId: number) {
		return (this.lendingService.acceptLend(id, userId))
	}

	@Patch(':id/reject')
	rejectLend(@Param('id', ParseIdPipe) id: number, @CurrentUser('sub') userId: number) {
		return (this.lendingService.rejectLend(id, userId))
	}

	@Patch(':id/cancel')
	cancelLend(@Param('id', ParseIdPipe) id: number, @CurrentUser('sub') userId: number) {
		return (this.lendingService.cancelLend(id, userId))
	}
}
