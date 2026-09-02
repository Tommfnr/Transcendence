import { Controller, Get, Delete, Param, UseGuards, ForbiddenException } from '@nestjs/common'
import { UsersService } from './users.service'
import { SharedAuthGuard, CurrentUser } from '@pep/shared'

@UseGuards(SharedAuthGuard)
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
	remove(@Param('id') id: string, @CurrentUser('sub') userId: number) {
		if (Number(id) !== userId)
			throw new ForbiddenException()
		return (this.usersService.remove(Number(id)))
	}
}
