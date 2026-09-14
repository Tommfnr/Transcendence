import { Controller, Get, Post, Delete, Body, Param, UseGuards, ParseIntPipe, HttpCode } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { CreateGroupDto } from './dto/creategroup.dto'
import { CurrentUser, SharedAuthGuard } from '@pep/shared'

@UseGuards(SharedAuthGuard)
@Controller('groups')
export class GroupsController {
	constructor(private readonly groupsService: GroupsService) {}

	@Post()
	create(@Body() dto: CreateGroupDto, @CurrentUser('sub') userId: number) {
		return (this.groupsService.create(dto, userId))
	}

	@Get()
	findAll() {
		return (this.groupsService.findAll())
	}

	@Get(':id/members')
	findMembers(@Param('id', ParseIntPipe) id: number) {
		return (this.groupsService.findMembers(id))
	}

	@Post(':id/members/:userId')
	addMember(@Param('id', ParseIntPipe) id: number, @Param('userId', ParseIntPipe) targetUserId: number, @CurrentUser('sub') requesterId: number) {
		return (this.groupsService.addMember(id, targetUserId, requesterId))
	}

	@Delete(':id/members/:userId')
	@HttpCode(204)
	removeMember(@Param('id', ParseIntPipe) id: number, @Param('userId', ParseIntPipe) targetUserId: number, @CurrentUser('sub') requesterId: number) {
		return (this.groupsService.removeMember(id, targetUserId, requesterId))
	}

	@Delete(':id')
	@HttpCode(204)
	deleteGroup(@Param('id', ParseIntPipe) id: number, @CurrentUser('sub') userId: number) {
		return (this.groupsService.deleteGroup(id, userId))
	}
}