import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { UsersService } from '../users/users.service'

@Controller('internal/users')
export class InternalUsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		const [user] = await this.usersService.findById(Number(id))
		if (!user) {
			throw new NotFoundException()
		}
		return (user)
	}
}
