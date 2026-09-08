import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const createGroupSchema = z.object({
	name: z
		.string("Please input a string")
		.min(1, 'Group name required')
		.max(30, 'Max 30 characters')
		.regex(/^[a-zA-Z ]{1,}$/, 'No special characters allowed for group name'),
	description: z
		.string("Please input a string")
		.max(500, 'Max 500 characters')
		.optional()
})

export class CreateGroupDto extends createZodDto(createGroupSchema) {}