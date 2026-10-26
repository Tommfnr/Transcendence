// Controller files handle the HTTP request mapping
// You'll find here GET/POST/DELETE requests calling functions through the ORM instance

import { Controller, Get, Post, Delete, Body, Param, UseGuards, Put, HttpCode } from '@nestjs/common'
import { ObjectsService } from './objects.service'
import { CreateObjectDto } from './dto/create-object.dto'
import { UpdateObjectDto } from './dto/update-object.dto'
import { CurrentUser, SharedAuthGuard, ParseIdPipe } from '@pep/shared'
import { ObjectOwnerGuard } from './guards/object-owner.guard'

@UseGuards(SharedAuthGuard)
@Controller('objects')
export class ObjectsController {
	constructor(private readonly objectsService: ObjectsService) {}

	@Get('my')
	findMy(@CurrentUser('sub') userId: number) {
		return (this.objectsService.findByUserId(userId))
	}

	// Declared before ':objectId' so "stats" is not parsed as an id
	@Get('stats')
	stats(@CurrentUser('sub') userId: number) {
		return (this.objectsService.stats(userId))
	}

	@Get(':objectId')
	@UseGuards(ObjectOwnerGuard)
	findOne(@Param('objectId', ParseIdPipe) objectId: number) {
		return (this.objectsService.findLiveByIdOrThrow(objectId))
	}

	@Post()
	create(@CurrentUser('sub') userId: number, @Body() dto: CreateObjectDto) {
		return (this.objectsService.create(userId, dto))
	}

	@Put(':objectId')
	@UseGuards(ObjectOwnerGuard)
	update(@Param('objectId', ParseIdPipe) objectId: number, @Body() dto: UpdateObjectDto) {
		return (this.objectsService.update(objectId, dto))
	}

	@Delete(':objectId')
	@HttpCode(204)
	@UseGuards(ObjectOwnerGuard)
	remove(@Param('objectId', ParseIdPipe) objectId: number) {
		return (this.objectsService.remove(objectId))
	}
}
