import { Controller, Get, Post, Patch, Delete, UseGuards, Param, Req, Body } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { UpdateMemberRoleDto } from './dto/update-member-role.dto'
import { AuthGuard } from '../auth/guard'
import { AuthenticatedRequest } from '../auth/types/authenticated-request'
import { GroupRoleGuard } from './guards/group-role.guard'

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
	@UseGuards(GroupRoleGuard)
	update(@Param('groupId') groupId: string, @Body() dto: UpdateGroupDto) {
		return this.groupsService.update(Number(groupId), dto)
	}

	@Post(':groupId/members/:targetUserId')
	@UseGuards(GroupRoleGuard)
	addMember(@Param('groupId') groupId: string, @Param('targetUserId') targetUserId: string) {
		return this.groupsService.addMember(Number(groupId), Number(targetUserId))
	}

	@Post(':groupId/objects/:objectId/grant')
	@UseGuards(GroupRoleGuard)
	grantObject(@Param('groupId') groupId: string, @Param('objectId') objectId: string, @Req() req: AuthenticatedRequest) {
		const requesterId = req.user.sub
		return this.groupsService.grantObject(Number(groupId), Number(objectId), requesterId)
	}

	@Delete(':groupId/objects/:objectId/grant')
	@UseGuards(GroupRoleGuard)
	revokeObject(@Param('groupId') groupId: string, @Param('objectId') objectId: string, @Req() req: AuthenticatedRequest) {
		const requesterId = req.user.sub
		return this.groupsService.revokeObject(Number(groupId), Number(objectId), requesterId)
	}

	@Patch(':groupId/members/:targetUserId/role')
	@UseGuards(GroupRoleGuard)
	updateMemberRole(@Param('groupId') groupId: string, @Param('targetUserId') targetUserId: string, @Body() dto: UpdateMemberRoleDto) {
		return this.groupsService.updateMemberRole(Number(groupId), Number(targetUserId), dto.role)
	}

	@Patch(':groupId/owner/:newOwnerId')
	@UseGuards(GroupRoleGuard)
	transferOwnership(@Param('groupId') groupId: string, @Param('newOwnerId') newOwnerId: string, @Req() req: AuthenticatedRequest) {
		const requesterId = req.user.sub
		return this.groupsService.transferOwnership(Number(groupId), Number(newOwnerId), requesterId)
	}

	@Delete(':groupId/members/:targetUserId')
	@UseGuards(GroupRoleGuard)
	removeMember(@Param('groupId') groupId: string, @Param('targetUserId') targetUserId: string) {
		return this.groupsService.removeMember(Number(groupId), Number(targetUserId))
	}

	@Delete(':groupId/leave')
	leaveGroup(@Param('groupId') groupId: string, @Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.groupsService.leaveGroup(Number(groupId), userId)
	}

	@Delete(':groupId')
	@UseGuards(GroupRoleGuard)
	deleteGroup(@Param('groupId') groupId: string, @Req() req: AuthenticatedRequest) {
		const requesterId = req.user.sub
		return this.groupsService.deleteGroup(Number(groupId), requesterId)
	}
}
