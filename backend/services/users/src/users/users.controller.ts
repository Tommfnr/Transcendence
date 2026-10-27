import { Body, Controller, Get, Delete, HttpCode, Param, Patch, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common'
import { SharedAuthGuard, CurrentUser, ParseIdPipe, UserView, usernameSchema } from '@pep/shared'
import { UsersProxyService } from './users-proxy.service'
import { UpdateMeDto } from './dto/update-me.dto'

function toPublicUser(user: UserView) {
	return ({ id: user.id, username: user.username })
}

@UseGuards(SharedAuthGuard)
@Controller('users')
export class UsersController {
	constructor(private readonly usersProxy: UsersProxyService) {}

	@Get()
	async findAll() {
		const users = await this.usersProxy.findAll()
		return (users.map(toPublicUser))
	}

	@Get('me')
	getMe(@CurrentUser('sub') userId: number) {
		return (this.usersProxy.findById(userId))
	}

	@Patch('me')
	updateMe(@CurrentUser('sub') userId: number, @Body() dto: UpdateMeDto) {
		return (this.usersProxy.update(userId, dto))
	}

	@Get('username/:username')
	async findByUsername(@Param('username') username: string) {
		if (!usernameSchema.safeParse(username).success)
			throw new NotFoundException('User not found')
		const user = await this.usersProxy.findByUsername(username)
		return (toPublicUser(user))
	}

	@Get(':id')
	async findOne(@Param('id', ParseIdPipe) id: number) {
		const user = await this.usersProxy.findById(id)
		return (toPublicUser(user))
	}

	@Delete(':id')
	@HttpCode(204)
	remove(@Param('id', ParseIdPipe) id: number, @CurrentUser('sub') userId: number) {
		if (id !== userId)
			throw new ForbiddenException()
		return (this.usersProxy.remove(id))
	}
}
