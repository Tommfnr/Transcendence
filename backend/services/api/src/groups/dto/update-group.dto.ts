import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema } from '../../zod/zod.schemas'

const updateGroupSchema = z.object({
	name:			nameSchema(30),
	description:	descriptionSchema.optional()
})

export class UpdateGroupDto extends createZodDto(updateGroupSchema) {}
