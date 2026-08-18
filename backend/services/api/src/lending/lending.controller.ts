import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards, Patch } from '@nestjs/common'
import { LendingService } from './lending.service'
import { AuthGuard } from '../auth/guard'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request'

@UseGuards(AuthGuard)
@Controller('lend')
export class LendingController {
	constructor(private readonly lendingService: LendingService) {}

	@Get()
	listAll() {
		return (this.lendingService.listALL_DEBUG())
	}

	@Post()
	newTransaction(@Body() dto: CreateTransactionDto, @Req() req: AuthenticatedRequest) { // need to add calling user Id
		return (this.lendingService.newTransaction(dto, req.user.sub))
	}
	
	@Get(':id')
	async findOne(@Param('id') id: string) {
		const [t] = await this.lendingService.findOne(id) 
		return (t)
	}

	@Patch(':id/accept')
	async acceptLend(@Param('id') transactionId: string) {
		return (this.lendingService.acceptLend(transactionId))
	}
}