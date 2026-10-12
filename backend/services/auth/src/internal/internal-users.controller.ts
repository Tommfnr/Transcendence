import { Body, Controller, Get, Delete, HttpCode, NotFoundException, Param, Put, UseGuards } from '@nestjs/common'
import { InternalAuthGuard, UserView, ParseIdPipe } from '@pep/shared'
import { UsersService } from '../users/users.service'
import { UpdateUserDto } from '../users/dto/update-user.dto'

@UseGuards(InternalAuthGuard)
@Controller('internal/users')
export class InternalUsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	findAll(): Promise<UserView[]> {
		return (this.usersService.findAll())
	}

	@Get('username/:username')
	findByUsername(@Param('username') username: string): Promise<UserView> {
		return (this.usersService.findByUsername(username))
	}

	@Get(':id')
	async findOne(@Param('id', ParseIdPipe) id: number): Promise<UserView> {
		const user = await this.usersService.findById(id)
		if (!user) {
			throw new NotFoundException()
		}
		return (user)
	}

	@Put(':id')
	async update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateUserDto): Promise<UserView> {
		const user = await this.usersService.update(id, dto)
		if (!user) {
			throw new NotFoundException()
		}
		return (user)
	}

	@Delete(':id')
	@HttpCode(204)
	async remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
		const deleted = await this.usersService.remove(id)
		if (!deleted) {
			throw new NotFoundException()
		}
	}
}
