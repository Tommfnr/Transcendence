import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema } from '@pep/shared'

export const updateGroupSchema = z.object({
	name:			nameSchema(30),
	description:	descriptionSchema.optional()
})

export class UpdateGroupDto extends createZodDto(updateGroupSchema) {}
