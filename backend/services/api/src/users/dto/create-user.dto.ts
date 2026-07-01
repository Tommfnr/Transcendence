import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { usernameSchema, passwordSchema } from '../../auth/dto/zod.schemas'

const createUserSchema = z.object({
	username: usernameSchema,
	email: z.email(),
	h_password: passwordSchema,
})

export class CreateUserDto extends createZodDto(createUserSchema) {}