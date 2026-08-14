import { Controller, Get, Delete, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common'
import { UsersService } from './users.service'
import { AuthenticatedRequest } from '../auth/types/authenticated-request'
import { AuthGuard } from '../auth/guard'

@UseGuards(AuthGuard)
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
	remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
		if (Number(id) !== req.user.sub)
			throw new ForbiddenException() // TODO : clarify error
		return (this.usersService.remove(Number(id)))
	}
}