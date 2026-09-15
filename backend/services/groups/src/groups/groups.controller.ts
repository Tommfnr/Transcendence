import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { UpdateMemberRoleDto } from './dto/update-member-role.dto'
import { CurrentUser, SharedAuthGuard } from '@pep/shared'
import { GroupAdminGuard } from './guards/group-admin.guard'
import { GroupMemberGuard } from './guards/group-member.guard'
import { GroupOwnerGuard } from './guards/group-owner.guard'

@UseGuards(SharedAuthGuard)
@Controller('groups')
export class GroupsController {
	constructor(private readonly groupsService: GroupsService) {}

	@Get()
	findAll() {
		return (this.groupsService.findAll())
	}

	@Get('my')
	findMy(@CurrentUser('sub') userId: number) {
		return (this.groupsService.findMy(userId))
	}

	@Get(':groupId')
	findOne(@Param('groupId', ParseIntPipe) groupId: number) {
		return (this.groupsService.findByIdOrThrow(groupId))
	}

	@Get(':groupId/members')
	@UseGuards(GroupMemberGuard)
	findMembers(@Param('groupId', ParseIntPipe) groupId: number) {
		return (this.groupsService.findMembers(groupId))
	}

	@Post()
	createGroup(@CurrentUser('sub') adminId: number, @Body() dto: CreateGroupDto) {
		return (this.groupsService.createGroup(adminId, dto))
	}

	@Post(':groupId/members/:targetUserId')
	@UseGuards(GroupAdminGuard)
	addMember(@Param('groupId', ParseIntPipe) groupId: number, @Param('targetUserId', ParseIntPipe) targetUserId: number) {
		return (this.groupsService.addMember(groupId, targetUserId))
	}

	@Patch(':groupId')
	@UseGuards(GroupAdminGuard)
	updateGroup(@Param('groupId', ParseIntPipe) groupId: number, @Body() dto: UpdateGroupDto) {
		return (this.groupsService.updateGroup(groupId, dto))
	}

	@Patch(':groupId/members/:targetUserId/role')
	@UseGuards(GroupAdminGuard)
	updateMemberRole(@Param('groupId', ParseIntPipe) groupId: number, @Param('targetUserId', ParseIntPipe) targetUserId: number, @Body() dto: UpdateMemberRoleDto) {
		return (this.groupsService.updateMemberRole(groupId, targetUserId, dto.role))
	}

	@Delete(':groupId/members/:targetUserId')
	@UseGuards(GroupAdminGuard)
	removeMember(@Param('groupId', ParseIntPipe) groupId: number, @Param('targetUserId', ParseIntPipe) targetUserId: number) {
		return (this.groupsService.removeMember(groupId, targetUserId))
	}

	@Delete(':groupId/leave')
	leaveGroup(@Param('groupId', ParseIntPipe) groupId: number, @CurrentUser('sub') userId: number) {
		return (this.groupsService.leaveGroup(groupId, userId))
	}

	@Delete(':groupId')
	@UseGuards(GroupOwnerGuard)
	deleteGroup(@Param('groupId', ParseIntPipe) groupId: number) {
		return (this.groupsService.deleteGroup(groupId))
	}
}
