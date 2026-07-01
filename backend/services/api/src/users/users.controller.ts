import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	findAll() {
		return (this.usersService.findAll())
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return (this.usersService.findById(Number(id)))
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return (this.usersService.remove(Number(id)))
	}
}