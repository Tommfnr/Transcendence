// Controller files handle the HTTP request mapping
// You'll find here GET/POST/DELETE requests calling functions through the ORM instance

import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Put, ParseIntPipe } from '@nestjs/common'
import { ObjectsService } from './objects.service'
import { CreateObjectDto } from './dto/create-object.dto'
import { UpdateObjectDto } from './dto/update-object.dto'
import { CurrentUser, SharedAuthGuard } from '@pep/shared'

@Controller('objects')
export class ObjectsController {
	constructor(private readonly objectsService: ObjectsService) {}

	@Get()
	findAll() {
		return (this.objectsService.findAll())
	}

	@Get('my')
	@UseGuards(SharedAuthGuard)
	findMy(@CurrentUser('sub') userId: number) {
			return (this.objectsService.findByUserId(userId))
	}
	
	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
			return (this.objectsService.findByIdOrThrow(Number(id)))
	}
	
	@Post()
	@UseGuards(SharedAuthGuard)
	create(@CurrentUser('sub') userId: number, @Body() dto: CreateObjectDto) {
			return (this.objectsService.create(userId, dto))
	}
	
	@Put(':id')
	@UseGuards(SharedAuthGuard)
	update(
			@CurrentUser('sub') userId: number,
			@Param('id', ParseIntPipe) id: number,
			@Body() dto: UpdateObjectDto
	) {
			return (this.objectsService.update(Number(id), userId, dto))
	}       

	@Delete(':id')
	@UseGuards(SharedAuthGuard)
	remove(@CurrentUser('sub') userId: number, @Param('id', ParseIntPipe) id: number) {
			return (this.objectsService.remove(Number(id), userId))
	}
}