import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { CreateGroupDto } from './dto/creategroup.dto'
import { UpdateMemberRoleDto } from './dto/update-member-role.dto'
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

	@Get('debug')
	debug(@Req() req: AuthenticatedRequest) {
		return { user : req.user }
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

	@Post(':id/objects/:objectId/grant')
	grantObject(@Param('id') id: string, @Param('objectId') objectId: string, @Req() req: AuthenticatedRequest) {
		return (this.groupsService.grantObject(Number(id), Number(objectId), req.user.sub))
	}

	@Patch(':id/members/:userId/role')
	updateMemberRole(@Param('id') id: string, @Param('userId') userId: string, @Body() dto: UpdateMemberRoleDto) {
		return (this.groupsService.updateMemberRole(Number(id), Number(userId), dto.role))
	}

	@Patch(':id/owner/:userId')
	transferOwnership(@Param('id') id: string, @Param('userId') userId: string, @Req() req: AuthenticatedRequest) {
		return (this.groupsService.transferOwnership(Number(id), Number(userId), req.user.sub))
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