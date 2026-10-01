import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema } from '@pep/shared'

export const createGroupSchema = z.object({
	name:			nameSchema(30),
	description:	descriptionSchema.optional()
})

export class CreateGroupDto extends createZodDto(createGroupSchema) {}
