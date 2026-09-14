import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const createTransactionSchema = z.object({
	objectId: z.number().int().positive(),
	lenderId: z.number().int().positive(),
	lendedFrom: z.iso.datetime(),
	lendedTo: z.iso.datetime(),
	message: z.string().trim().max(250, 'Max 250 characters').optional(),
}).refine((dto) => new Date(dto.lendedTo) > new Date(dto.lendedFrom), {
	message: 'Impossible dates',
	path: ['lendedTo'],
})

export class CreateTransactionDto extends createZodDto(createTransactionSchema) {}
