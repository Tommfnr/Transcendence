import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common'
import { InternalAuthGuard, ObjectView } from '@pep/shared'
import { ObjectsService } from '../objects/objects.service'

function parseIds(raw: string | undefined): number[] {
	if (!raw) {
		return ([])
	}

	return (raw
		.split(',')
		.map((value) => Number(value.trim()))
		.filter((value) => Number.isInteger(value) && value > 0))
}

@UseGuards(InternalAuthGuard)
@Controller('internal/objects')
export class InternalObjectsController {
	constructor(private readonly objectsService: ObjectsService) {}

	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<ObjectView> {
		const object = await this.objectsService.findByIdOrThrow(id)

		return ({ id: object.id, ownerId: object.ownerId, isAvailable: object.isAvailable })
	}

	@Get(':id/granted-groups')
	async findGrantedGroups(@Param('id', ParseIntPipe) id: number): Promise<{ groupIds: number[] }> {
		const grants = await this.objectsService.findGrantedGroupIds(id)

		return ({ groupIds: grants.map(g => g.groupId) })
	}

	@Get('granted-to')
	async findGrantedTo(@Query('groupIds') groupIds?: string) {
		const ids = parseIds(groupIds)

		if (ids.length === 0) {
			return ([])
		}

		return (this.objectsService.findObjectsGrantedToGroups(ids))
	}
}
