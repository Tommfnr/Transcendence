import { Controller, Get, Delete, HttpCode, Param, ParseIntPipe, UseGuards, ForbiddenException } from '@nestjs/common'
import { SharedAuthGuard, CurrentUser } from '@pep/shared'
import { UsersProxyService } from './users-proxy.service'

@UseGuards(SharedAuthGuard)
@Controller('users')
export class UsersController {
	constructor(private readonly usersProxy: UsersProxyService) {}

	@Get()
	findAll() {
		return (this.usersProxy.findAll())
	}

	@Get('me')
	getMe(@CurrentUser('sub') userId: number) {
		return (this.usersProxy.findById(userId))
	}

	@Get('username/:username')
	findByUsername(@Param('username') username: string) {
		return (this.usersProxy.findByUsername(username))
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return (this.usersProxy.findById(id))
	}

	@Delete(':id')
	@HttpCode(204)
	remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('sub') userId: number) {
		if (id !== userId)
			throw new ForbiddenException()
		return (this.usersProxy.remove(id))
	}
}
