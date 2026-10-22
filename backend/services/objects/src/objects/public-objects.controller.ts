import { Body, Controller, Get, Post, Put, Delete, HttpCode, Param, UseGuards } from '@nestjs/common'
import { ObjectsService } from './objects.service'
import { ApiKeyGuard, CurrentUser, ParseIdPipe } from '@pep/shared'
import { CreateObjectDto } from './dto/create-object.dto'
import { ObjectOwnerGuard } from './guards/object-owner.guard'
import { UpdateObjectDto } from './dto/update-object.dto'

@UseGuards(ApiKeyGuard)
@Controller('public/v1/objects')
export class PublicObjectsController {
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
