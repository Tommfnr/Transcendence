import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema } from '../../zod/zod.schemas'

const updateObjectSchema = z.object({
	name:			nameSchema(30).optional(),
	type:			z.string().min(1, 'Type required').max(20, 'Max 20 characters').optional(),
	description:	descriptionSchema,
	condition:		z.enum(['new', 'good', 'worn']).optional(),
	isAvailable:	z.boolean().optional(),
})

export class UpdateObjectDto extends createZodDto(updateObjectSchema) {}
