import { Body, Controller, HttpCode, Logger, Post, UseGuards } from '@nestjs/common'
import { createZodDto } from 'nestjs-zod'
import { EVENT, InternalAuthGuard, envelopeSchema, userDeletedDataSchema } from '@pep/shared'
import { ObjectsService } from '../groups/Groups.service'

class EventEnvelopeDto extends createZodDto(envelopeSchema) {}

@UseGuards(InternalAuthGuard)
@Controller('internal/events')
export class EventsController {
	private readonly logger = new Logger(EventsController.name)

	constructor(private readonly objectsService : ObjectsService) {}

	@Post()
	@HttpCode(204)
	async receive(@Body() envelope: EventEnvelopeDto): Promise <void> {
		if (envelope.event !== EVENT.UserDeleted) {
			return
		}

		const parsed = userDeletedDataSchema.safeParse(envelope.data)
		if (!parsed.success) {
			this.logger.warn(`Ignoring malformed ${envelope.event} payload from ${envelope.producer}`)
			return
		}

		const removed = await this.objectsService.removeAllByOwner(parsed.data.userId)
		this.logger.log(`user.deleted(${parsed.data.userId}) -> removed ${removed} objects`)
	}
}