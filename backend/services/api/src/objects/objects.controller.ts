// Controller files handle the HTTP request mapping
// You'll find here GET/POST/DELETE requests calling functions through the ORM instance

import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common'
import { ObjectsService } from './objects.service'
import { CreateObjectDto } from './dto/create-object.dto'

@Controller('objects')
export class ObjectsController {
	constructor(private readonly objectsService: ObjectsService) {}

	@Get()
	findAll() {
		return (this.objectsService.findAll())
	}

	@Post()
	create(@Body() dto: CreateObjectDto) {
		return (this.objectsService.create(dto))
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return (this.objectsService.remove(Number(id)))
	}
}