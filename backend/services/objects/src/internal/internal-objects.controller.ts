import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { InternalAuthGuard, ObjectView } from '@pep/shared'
import { ObjectsService } from '../objects/objects.service'

@UseGuards(InternalAuthGuard)
@Controller('internal/objects')
export class InternalObjectsController {
	constructor(private readonly objectsService: ObjectsService) {}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<ObjectView> {
		const object = await this.objectsService.findByIdOrThrow(id)

		return ({ id: object.id, ownerId: object.ownerId, isAvailable: object.isAvailable })
	}
}
