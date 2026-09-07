import type { ZodType } from 'zod'

export const EVENT_HANDLER_MAP = Symbol('EVENT_HANDLER_MAP')

/**
 * One reaction a service registers for an inbound event. `inject` lists the
 * providers Nest resolves and hands to `useFactory`, which returns the actual
 * handler. The handler only runs after the envelope's `data` passes `schema`.
 */
export interface EventHandlerRegistration<TData = unknown> {
	event: string
	schema: ZodType<TData>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	inject?: any[]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	useFactory: (...deps: any[]) => (data: TData) => Promise<void> | void
}

export interface SharedEventsModuleOptions {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	imports?: any[]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handlers: EventHandlerRegistration<any>[]
}

export interface CompiledEventHandler {
	schema: ZodType
	handle: (data: unknown) => Promise<void> | void
}

export type EventHandlerMap = Map<string, CompiledEventHandler>
