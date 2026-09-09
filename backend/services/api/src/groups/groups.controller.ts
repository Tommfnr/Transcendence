import { Controller, Get, Post, Patch, Delete, UseGuards, Param, Req, Body } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { UpdateMemberRoleDto } from './dto/update-member-role.dto'
import { AuthGuard } from '../auth/guard'
import { AuthenticatedRequest } from '../auth/types/authenticated-request'
import { GroupAdminGuard } from './guards/group-admin.guard'
import { GroupMemberGuard } from './guards/group-member.guard'

@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
	constructor(private readonly groupsService: GroupsService) {}

	@Get()
	findAll() {
		return this.groupsService.findAll()
	}

	@Get('my')
	findMy(@Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.groupsService.findMy(userId)
	}

	@Get(':groupId')
	findOne(@Param('groupId') groupId: string) {
		return this.groupsService.findOne(Number(groupId))
	}

	@Get(':groupId/members')
	findMembers(@Param('groupId') groupId: string) {
		return this.groupsService.findMembers(Number(groupId))
	}

	@Get(':groupId/objects')
	findGrantedObjects(@Param('groupId') groupId: string) {
		return this.groupsService.findGrantedObjects(Number(groupId))
	}

	@Post()
	create(@Req() req: AuthenticatedRequest, @Body() dto: CreateGroupDto) {
		const adminId = req.user.sub
		return this.groupsService.create(dto, adminId)
	}

	@Patch(':groupId')
	@UseGuards(GroupAdminGuard)
	update(@Param('groupId') groupId: string, @Body() dto: UpdateGroupDto) {
		return this.groupsService.update(Number(groupId), dto)
	}

	@Post(':groupId/members/:targetUserId')
	@UseGuards(GroupAdminGuard)
	addMember(@Param('groupId') groupId: string, @Param('targetUserId') targetUserId: string) {
		return this.groupsService.addMember(Number(groupId), Number(targetUserId))
	}

	@Post(':groupId/objects/:objectId/grant')
	@UseGuards(GroupMemberGuard)
	grantObject(@Param('groupId') groupId: string, @Param('objectId') objectId: string, @Req() req: AuthenticatedRequest) {
		const requesterId = req.user.sub
		return this.groupsService.grantObject(Number(groupId), Number(objectId), requesterId)
	}

	@Delete(':groupId/objects/:objectId/grant')
	@UseGuards(GroupMemberGuard)
	revokeObject(@Param('groupId') groupId: string, @Param('objectId') objectId: string, @Req() req: AuthenticatedRequest) {
		const requesterId = req.user.sub
		return this.groupsService.revokeObject(Number(groupId), Number(objectId), requesterId)
	}

	@Patch(':groupId/members/:targetUserId/role')
	@UseGuards(GroupAdminGuard)
	updateMemberRole(@Param('groupId') groupId: string, @Param('targetUserId') targetUserId: string, @Body() dto: UpdateMemberRoleDto) {
		return this.groupsService.updateMemberRole(Number(groupId), Number(targetUserId), dto.role)
	}

	@Delete(':groupId/members/:targetUserId')
	@UseGuards(GroupAdminGuard)
	removeMember(@Param('groupId') groupId: string, @Param('targetUserId') targetUserId: string) {
		return this.groupsService.removeMember(Number(groupId), Number(targetUserId))
	}

	@Delete(':groupId/leave')
	leaveGroup(@Param('groupId') groupId: string, @Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.groupsService.leaveGroup(Number(groupId), userId)
	}

	@Delete(':groupId')
	@UseGuards(GroupAdminGuard)
	deleteGroup(@Param('groupId') groupId: string, @Req() req: AuthenticatedRequest) {
		const requesterId = req.user.sub
		return this.groupsService.deleteGroup(Number(groupId), requesterId)
	}
}
