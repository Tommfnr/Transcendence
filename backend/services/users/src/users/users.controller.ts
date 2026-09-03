import { Controller, Get, Delete, HttpCode, Param, UseGuards, ForbiddenException } from '@nestjs/common'
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

	@Get(':id')
	findOne(@Param('id') id: string) {
		return (this.usersProxy.findById(Number(id)))
	}

	@Delete(':id')
	@HttpCode(204)
	remove(@Param('id') id: string, @CurrentUser('sub') userId: number) {
		if (Number(id) !== userId)
			throw new ForbiddenException()
		return (this.usersProxy.remove(Number(id)))
	}
}
