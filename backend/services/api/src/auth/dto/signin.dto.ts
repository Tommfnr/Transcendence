import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { usernameSchema } from './schemas'

const signInSchema = z.object({
	username: usernameSchema,
	password: z.string().min(1),
})

export class SignInDto extends createZodDto(signInSchema) {}