import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const createObjectSchema = z.object({
	name:			z.string().min(1, 'Name required').max(20, 'Max 20 characters'),
	type:			z.string().min(1, 'Type required').max(20, 'Max 20 characters'),
	description:	z.string().max(500, 'Max 500 characters').optional(),
	condition:		z.enum(['new', 'good', 'worn']),
	isAvailable:	z.boolean(),

})

export class CreateObjectDto extends createZodDto(createObjectSchema) {}
