// Controller files handle the HTTP request mapping
// You'll find here GET/POST/DELETE requests calling functions through the ORM instance

import { Controller, Get, Post, Delete, Body, Param, UseGuards, Put, ParseIntPipe, HttpCode } from '@nestjs/common'
import { ObjectsService } from './objects.service'
import { CreateObjectDto } from './dto/create-object.dto'
import { UpdateObjectDto } from './dto/update-object.dto'
import { GrantObjectDto } from './dto/grant-object.dto'
import { CurrentUser, SharedAuthGuard } from '@pep/shared'
import { ObjectOwnerGuard } from './guards/object-owner.guard'

@UseGuards(SharedAuthGuard)
@Controller('objects')
export class ObjectsController {
	constructor(private readonly objectsService: ObjectsService) {}

	@Get()
	findAll() {
		return (this.objectsService.findAll())
	}

	@Get('my')
	findMy(@CurrentUser('sub') userId: number) {
		return (this.objectsService.findByUserId(userId))
	}

	@Get(':objectId')
	findOne(@Param('objectId', ParseIntPipe) objectId: number) {
		return (this.objectsService.findByIdOrThrow(objectId))
	}

	@Post()
	create(@CurrentUser('sub') userId: number, @Body() dto: CreateObjectDto) {
		return (this.objectsService.create(userId, dto))
	}

	@Put(':objectId')
	@UseGuards(ObjectOwnerGuard)
	update(@Param('objectId', ParseIntPipe) objectId: number, @Body() dto: UpdateObjectDto) {
		return (this.objectsService.update(objectId, dto))
	}

	@Delete(':objectId')
	@HttpCode(204)
	@UseGuards(ObjectOwnerGuard)
	remove(@Param('objectId', ParseIntPipe) objectId: number) {
		return (this.objectsService.remove(objectId))
	}

	@Post(':objectId/grants')
	@UseGuards(ObjectOwnerGuard)
	grantToGroup(
		@Param('objectId', ParseIntPipe) objectId: number,
		@CurrentUser('sub') userId: number,
		@Body() dto: GrantObjectDto,
	) {
		return (this.objectsService.grantToGroup(objectId, dto.groupId, userId))
	}

	@Delete(':objectId/grants/:groupId')
	@HttpCode(204)
	@UseGuards(ObjectOwnerGuard)
	revokeFromGroup(
		@Param('objectId', ParseIntPipe) objectId: number,
		@Param('groupId', ParseIntPipe) groupId: number,
	) {
		return (this.objectsService.revokeFromGroup(objectId, groupId))
	}

	@Get(':objectId/grants')
	findGrantedGroupIds(@Param('objectId', ParseIntPipe) objectId: number) {
		return (this.objectsService.findGrantedGroupIds(objectId))
	}
}
