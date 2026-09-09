// Controller files handle the HTTP request mapping
// You'll find here GET/POST/DELETE requests calling functions through the ORM instance

import { Controller, Get, Post, Put, Delete, UseGuards, Param, Req, Body } from '@nestjs/common'
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
		return this.objectsService.findAll()
	}

	@Get('my')
	@UseGuards(AuthGuard)
	findMy(@Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.objectsService.findByUserId(userId)
	}

	@Get(':objectId')
	@UseGuards(AuthGuard)
	findOne(@Param('objectId') objectId: string) {
		return this.objectsService.findByIdOrThrow(Number(objectId))
	}

	@Post()
	@UseGuards(AuthGuard)
	create(@Req() req: AuthenticatedRequest, @Body() dto: CreateObjectDto) {
		const userId = req.user.sub
		return this.objectsService.create(userId, dto)
	}

	@Put(':objectId')
	@UseGuards(AuthGuard)
	update(@Param('objectId') objectId: string, @Req() req: AuthenticatedRequest, @Body() dto: UpdateObjectDto) {
		const userId = req.user.sub
		return this.objectsService.update(Number(objectId), userId, dto)
	}

	@Delete(':objectId')
	@UseGuards(AuthGuard)
	remove(@Param('objectId') objectId: string, @Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.objectsService.remove(Number(objectId), userId)
	}
}
