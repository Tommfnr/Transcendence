import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { CreateGroupDto } from './dto/creategroup.dto'
import { AuthenticatedRequest } from '../auth/types/authenticated-request'
import { AuthGuard } from '../auth/guard'

@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
	constructor(private readonly groupsService: GroupsService) {}

	@Post()
	create(@Body() dto: CreateGroupDto, @Req() req: AuthenticatedRequest) {
		return (this.groupsService.create(dto, req.user.sub))
	}

	@Get()
	findAll() {
		return (this.groupsService.findAll())
	}

	@Get(':id/members')
	findMembers(@Param('id') id: string) {
		return (this.groupsService.findMembers(Number(id)))
	}

	@Post(':id/members/:userId')
	addMember(@Param('id') id: string, @Param('userId') userId: string, @Req() req: AuthenticatedRequest) {
		return (this.groupsService.addMember(Number(id), Number(userId), req.user.sub))
	}

	@Delete(':id/members/:userId')
	removeMember(@Param('id') id: string, @Param('userId') userId: string, @Req() req: AuthenticatedRequest) {
		return (this.groupsService.removeMember(Number(id), Number(userId), req.user.sub))
	}

	@Delete(':id')
	deleteGroup(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
		return (this.groupsService.deleteGroup(Number(id), req.user.sub))
	}
}