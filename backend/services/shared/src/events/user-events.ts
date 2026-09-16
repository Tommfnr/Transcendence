import { z } from 'zod'
import { EVENT } from './event-names'
import type { EventEnvelope } from './envelope'

export const userRegisteredDataSchema = z.object({
	userId: z.number().int().positive(),
	username: z.string().min(1),
	email: z.string().min(1),
})
export type UserRegisteredData = z.infer<typeof userRegisteredDataSchema>
export type UserRegisteredEvent = EventEnvelope<typeof EVENT.UserRegistered, UserRegisteredData>

export const userDeletedDataSchema = z.object({
	userId: z.number().int().positive(),
})
export type UserDeletedData = z.infer<typeof userDeletedDataSchema>
export type UserDeletedEvent = EventEnvelope<typeof EVENT.UserDeleted, UserDeletedData>

export const groupDeletedDataSchema = z.object({
	groupId: z.number().int().positive(),
})
export type GroupDeletedData = z.infer<typeof groupDeletedDataSchema>
export type GroupDeletedEvent = EventEnvelope<typeof EVENT.GroupDeleted, GroupDeletedData>
