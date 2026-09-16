import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const grantObjectSchema = z.object({
	groupId: z
		.number('Please input a number')
		.int('Group ID must be an integer')
		.positive('Group ID must be positive'),
})

export class GrantObjectDto extends createZodDto(grantObjectSchema) {}
