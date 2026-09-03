import { Controller, Get, Delete, HttpCode, NotFoundException, Param } from '@nestjs/common'
import { UsersService } from '../users/users.service'

@Controller('internal/users')
export class InternalUsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	findAll() {
		return (this.usersService.findAll())
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		const [user] = await this.usersService.findById(Number(id))
		if (!user) {
			throw new NotFoundException()
		}
		return (user)
	}

	@Delete(':id')
	@HttpCode(204)
	async remove(@Param('id') id: string) {
		const [user] = await this.usersService.findById(Number(id))
		if (!user) {
			throw new NotFoundException()
		}
		await this.usersService.remove(Number(id))
	}
}
