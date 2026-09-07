import { DynamicModule, Module } from '@nestjs/common'
import { SharedEventsController } from './shared-events.controller'
import {
	EVENT_HANDLER_MAP,
	type EventHandlerMap,
	type SharedEventsModuleOptions,
} from './shared-events.types'

/**
 * Owns the `POST /internal/events` endpoint: guard, envelope validation,
 * per-event `data` parsing, malformed-payload warn-and-ack, and dispatch to the
 * matching handler. A service supplies only its `handlers` array; everything
 * else is identical across services.
 */
@Module({})
export class SharedEventsModule {
	static register(options: SharedEventsModuleOptions): DynamicModule {
		const seen = new Set<string>()
		for (const handler of options.handlers) {
			if (seen.has(handler.event)) {
				throw new Error(`SharedEventsModule: duplicate handler for "${handler.event}"`)
			}
			seen.add(handler.event)
		}

		const flatDeps = options.handlers.flatMap((handler) => handler.inject ?? [])

		const handlerMapProvider = {
			provide: EVENT_HANDLER_MAP,
			inject: flatDeps,
			useFactory: (...resolved: unknown[]): EventHandlerMap => {
				const map: EventHandlerMap = new Map()
				let cursor = 0

				for (const handler of options.handlers) {
					const depCount = (handler.inject ?? []).length
					const deps = resolved.slice(cursor, cursor + depCount)
					cursor += depCount

					map.set(handler.event, {
						schema: handler.schema,
						handle: handler.useFactory(...deps),
					})
				}

				return map
			},
		}

		return {
			module: SharedEventsModule,
			imports: options.imports ?? [],
			controllers: [SharedEventsController],
			providers: [handlerMapProvider],
		}
	}
}
