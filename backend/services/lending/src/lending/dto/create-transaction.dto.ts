import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { idSchema, hasNoNulChar } from '@pep/shared'

const lendingDateSchema = z.iso.datetime({ offset: true }).or(z.iso.datetime()).or(z.iso.date())

export const createTransactionSchema = z.object({
	objectId: idSchema,
	postId: idSchema,
	lendedFrom: lendingDateSchema,
	lendedTo: lendingDateSchema,
	message: z.string().trim().max(250, 'Max 250 characters').refine(hasNoNulChar, 'Invalid character').optional(),
}).refine((dto) => new Date(dto.lendedTo) > new Date(dto.lendedFrom), {
	message: 'Impossible dates',
	path: ['lendedTo'],
}).refine((dto) => {
	const startOfToday = new Date()
	startOfToday.setUTCHours(0, 0, 0, 0)
	return (new Date(dto.lendedFrom) >= startOfToday)
}, {
	message: 'Start date cannot be in the past',
	path: ['lendedFrom'],
})

export class CreateTransactionDto extends createZodDto(createTransactionSchema) {}
