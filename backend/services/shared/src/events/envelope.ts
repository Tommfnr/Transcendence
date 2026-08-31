import { z } from 'zod'

export const envelopeSchema = z.object({
	event: z.string().min(1),
	occurredAt: z.string(),
	producer: z.string().min(1),
	data: z.unknown(),
})

export interface EventEnvelope<TName extends string = string, TData = unknown> {
	event: TName
	occurredAt: string
	producer: string
	data: TData
}

export function makeEvent<TName extends string, TData>(
	event: TName,
	producer: string,
	data: TData,
): EventEnvelope<TName, TData> {
	return { event, producer, data, occurredAt: new Date().toISOString() }
}
