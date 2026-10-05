import type { InjectionToken, ModuleMetadata } from '@nestjs/common'
import type { ZodType } from 'zod'
import type { EventName } from './event-names'

export const EVENT_HANDLER_MAP = Symbol('EVENT_HANDLER_MAP')

/**
 * One reaction a service registers for an inbound event. `inject` lists the
 * providers Nest resolves and hands to `useFactory`, which returns the actual
 * handler. The handler only runs after the envelope's `data` passes `schema`.
 */
export interface EventHandlerRegistration<TData = unknown> {
	event: EventName
	schema: ZodType<TData>
	inject?: InjectionToken[]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	useFactory: (...deps: any[]) => (data: TData) => Promise<void> | void
}

/**
 * Identity helper: infers `TData` from `schema` so a registration whose
 * `useFactory` handler expects a different shape than `schema` produces is
 * rejected at the call site. `SharedEventsModuleOptions.handlers` is a
 * heterogeneous array, so each element must be wrapped here to keep the check.
 */
export function defineEventHandler<TData>(
	registration: EventHandlerRegistration<TData>,
): EventHandlerRegistration<TData> {
	return registration
}

export interface SharedEventsModuleOptions {
	imports?: ModuleMetadata['imports']
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handlers: EventHandlerRegistration<any>[]
}

export interface CompiledEventHandler {
	schema: ZodType
	handle: (data: unknown) => Promise<void> | void
}

export type EventHandlerMap = Map<string, CompiledEventHandler>
