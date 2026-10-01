import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { usernameSchema, passwordSchema, emailSchema } from '@pep/shared'

const registerSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
	h_password: passwordSchema,
})

export class RegisterDto extends createZodDto(registerSchema) {}
