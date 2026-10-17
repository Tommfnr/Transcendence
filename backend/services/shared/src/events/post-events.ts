import { z } from 'zod'
import { EVENT } from './event-names'
import type { EventEnvelope } from './envelope'

export const postDeletedDataSchema = z.object({
	postId: z.number().int().positive(),
})
export type PostDeletedData = z.infer<typeof postDeletedDataSchema>
export type PostDeletedEvent = EventEnvelope<typeof EVENT.PostDeleted, PostDeletedData>
