import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const updateObjectSchema = z.object({
	name:			z.string().min(1, 'Name required').max(20, 'Max 20 characters').optional(),
	type:			z.string().min(1, 'Type required').max(20, 'Max 20 characters').optional(),
	description:	z.string().max(500, 'Max 500 characters').optional(),
	condition:		z.enum(['new', 'good', 'worn']).optional(),
	isAvailable:	z.boolean().optional(),
})

export class UpdateObjectDto extends createZodDto(updateObjectSchema) {}
