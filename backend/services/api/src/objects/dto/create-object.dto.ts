import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema, objectTypeSchema, objectConditionSchema } from '../../zod/zod.schemas'

const createObjectSchema = z.object({
	name:			nameSchema(30),
	type:			objectTypeSchema,
	description:	descriptionSchema.optional(),
	condition:		objectConditionSchema,
	isAvailable:	z.boolean(),

})

export class CreateObjectDto extends createZodDto(createObjectSchema) {}
