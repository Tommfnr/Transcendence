import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { usernameSchema } from '@pep/shared'

const updateUserSchema = z.object({
	username: usernameSchema,
})

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
