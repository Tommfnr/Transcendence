import { z } from 'zod'
import { EVENT } from './event-names'
import type { EventEnvelope } from './envelope'

export const objectDeletedDataSchema = z.object({
	objectId: z.number().int().positive(),
})
export type ObjectDeletedData = z.infer<typeof objectDeletedDataSchema>
export type ObjectDeletedEvent = EventEnvelope<typeof EVENT.ObjectDeleted, ObjectDeletedData>
