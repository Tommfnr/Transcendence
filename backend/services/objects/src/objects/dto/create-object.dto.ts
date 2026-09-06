import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const createObjectSchema = z.object({
	brand: z.string().trim().min(1, 'Brand is required').max(20, 'Max 20 characters'),
	type: z.string().trim().min(1, 'Type is required').max(20, 'Max 20 characters'),
	description: z.string().trim().max(100, 'Max 100 characters').optional(),
	condition: z.string().trim().max(50, 'Max 50 characters').optional(),
})

export class CreateObjectDto extends createZodDto(createObjectSchema) {}