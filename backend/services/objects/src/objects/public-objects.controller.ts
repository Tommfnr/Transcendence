import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ObjectsService } from './objects.service'
import { ApiKeyGuard, ParseIdPipe } from '@pep/shared'

@UseGuards(ApiKeyGuard)
@Controller('public/v1/objects')
export class PublicObjectsController {
	constructor(private readonly objectsService: ObjectsService) {}

	@Get()
	findAll() {
		return (this.objectsService.findAll())
	}

	@Get(':objectId')
	findOne(@Param('objectId', ParseIdPipe) objectId: number) {
		return (this.objectsService.findByIdOrThrow(objectId))
	}
}
