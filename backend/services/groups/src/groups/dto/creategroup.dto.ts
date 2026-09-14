import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { groupNameSchema } from '@pep/shared'

export const createGroupSchema = z.object({
	name: groupNameSchema,
})

export class CreateGroupDto extends createZodDto(createGroupSchema) {}
