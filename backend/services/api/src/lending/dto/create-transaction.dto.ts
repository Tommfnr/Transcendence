import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const createTransactionSchema = z.object({
	objectId: z.number("Please input a number").int().positive(),
	lendedFrom: z.iso.datetime({ offset: true }).or(z.iso.date()),
	lendedTo: z.iso.datetime({ offset: true }).or(z.iso.date()),
	message: z.string().max(250, 'Max 250 characters').optional(),
})

export class CreateTransactionDto extends createZodDto(createTransactionSchema) {}
