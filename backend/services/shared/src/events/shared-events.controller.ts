import { Body, Controller, HttpCode, Inject, Logger, Post, UseGuards } from '@nestjs/common'
import { InternalAuthGuard } from '../http/internal-auth.guard'
import { EventEnvelopeDto } from './envelope.dto'
import { EVENT_HANDLER_MAP, type EventHandlerMap } from './shared-events.types'

@UseGuards(InternalAuthGuard)
@Controller('internal/events')
export class SharedEventsController {
	private readonly logger = new Logger(SharedEventsController.name)

	constructor(@Inject(EVENT_HANDLER_MAP) private readonly handlers: EventHandlerMap) {}

	@Post()
	@HttpCode(204)
	async receive(@Body() envelope: EventEnvelopeDto): Promise<void> {
		const handler = this.handlers.get(envelope.event)
		if (!handler) {
			return
		}

		const parsed = handler.schema.safeParse(envelope.data)
		if (!parsed.success) {
			this.logger.warn(`Ignoring malformed ${envelope.event} payload from ${envelope.producer}`)
			return
		}

		await handler.handle(parsed.data)
	}
}
