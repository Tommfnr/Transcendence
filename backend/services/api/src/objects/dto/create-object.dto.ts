import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema } from '../../zod/zod.schemas'

const createObjectSchema = z.object({
	name:			nameSchema(30),
	type:			z.string().min(1, 'Type required').max(20, 'Max 20 characters'),
	description:	descriptionSchema,
	condition:		z.enum(['new', 'good', 'worn']),
	isAvailable:	z.boolean(),

})

export class CreateObjectDto extends createZodDto(createObjectSchema) {}
