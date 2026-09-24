import { Controller, Get, Post, Body, Param, UseGuards, Patch, ParseIntPipe } from '@nestjs/common'
import { LendingService } from './lending.service'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { CurrentUser, SharedAuthGuard } from '@pep/shared'

@UseGuards(SharedAuthGuard)
@Controller('lending')
export class LendingController {
	constructor(private readonly lendingService: LendingService) {}

	@Get()
	listAll(@CurrentUser('sub') userId: number) {
		return (this.lendingService.listAll(userId))
	}

	@Post()
	newTransaction(@Body() dto: CreateTransactionDto, @CurrentUser('sub') userId: number) {
		return (this.lendingService.newTransaction(dto, userId))
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('sub') userId: number) {
		return (this.lendingService.findOne(id, userId))
	}

	@Patch(':id/accept')
	acceptLend(@Param('id', ParseIntPipe) id: number, @CurrentUser('sub') userId: number) {
		return (this.lendingService.acceptLend(id, userId))
	}
}
