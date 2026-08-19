// Controller files handle the HTTP request mapping
// You'll find here GET/POST/DELETE requests calling functions through the ORM instance

import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Put } from '@nestjs/common'
import { ObjectsService } from './objects.service'
import { CreateObjectDto } from './dto/create-object.dto'
import { UpdateObjectDto } from './dto/update-object.dto'
import { AuthGuard } from '../auth/guard'
import { AuthenticatedRequest } from '../auth/types/authenticated-request'

@Controller('objects')
export class ObjectsController {
	constructor(private readonly objectsService: ObjectsService) {}

	@Get()
	findAll() {
		return (this.objectsService.findAll())
	}

	@Get('my')
	@UseGuards(AuthGuard)
	findMy(@Request() req: AuthenticatedRequest) {
			const userId = req.user.sub
			return (this.objectsService.findByUserId(userId))
	}
	
	@Get(':id')
	findOne(@Param('id') id: string) {
			return (this.objectsService.findByIdOrThrow(Number(id)))
	}
	
	@Post()
	@UseGuards(AuthGuard)
	create(@Request() req: AuthenticatedRequest, @Body() dto: CreateObjectDto) {
			const userId = req.user.sub
			return (this.objectsService.create(userId, dto))
	}
	
	@Put(':id')
	@UseGuards(AuthGuard)
	update(
			@Request() req: AuthenticatedRequest,
			@Param('id') id: string,
			@Body() dto: UpdateObjectDto
	) {
			const userId = req.user.sub
			return (this.objectsService.update(Number(id), userId, dto))
	}       

	@Delete(':id')
	@UseGuards(AuthGuard)
	remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
			const userId = req.user.sub
			return (this.objectsService.remove(Number(id), userId))
	}
}