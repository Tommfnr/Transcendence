import { Controller, Get, Delete, HttpCode, NotFoundException, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { InternalAuthGuard, UserView } from '@pep/shared'
import { UsersService } from '../users/users.service'

@UseGuards(InternalAuthGuard)
@Controller('internal/users')
export class InternalUsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	findAll(): Promise<UserView[]> {
		return (this.usersService.findAll())
	}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserView> {
		const user = await this.usersService.findById(id)
		if (!user) {
			throw new NotFoundException()
		}
		return (user)
	}

	@Delete(':id')
	@HttpCode(204)
	async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		const deleted = await this.usersService.remove(id)
		if (!deleted) {
			throw new NotFoundException()
		}
	}
}
