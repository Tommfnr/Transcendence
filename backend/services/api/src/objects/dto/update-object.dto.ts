import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema, objectTypeSchema, objectConditionSchema } from '../../zod/zod.schemas'

const updateObjectSchema = z.object({
	name:			nameSchema(30).optional(),
	type:			objectTypeSchema.optional(),
	description:	descriptionSchema,
	condition:		objectConditionSchema.optional(),
	isAvailable:	z.boolean().optional(),
})

export class UpdateObjectDto extends createZodDto(updateObjectSchema) {}
