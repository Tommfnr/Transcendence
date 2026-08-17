import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common'
import { LendingService } from './lending.service'
import { AuthGuard } from '../auth/guard'

@UseGuards(AuthGuard)
@Controller('lend')
export class LendingController {
	constructor(private readonly lendingService: LendingService) {}

	@Get()
	listAll() {
		return (this.lendingService.listALL_DEBUG())
	}
	
}