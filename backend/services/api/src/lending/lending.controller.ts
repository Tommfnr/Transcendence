import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common'
import { LendingService } from './lending.service'
import { AuthGuard } from '../auth/guard'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request'

@UseGuards(AuthGuard)
@Controller('lend')
export class LendingController {
	constructor(private readonly lendingService: LendingService) {}

	@Post()
	newTransaction(@Body() dto: CreateTransactionDto, @Req() req: AuthenticatedRequest) {
		return (this.lendingService.newTransaction(dto, req.user.sub))
	}
	
}