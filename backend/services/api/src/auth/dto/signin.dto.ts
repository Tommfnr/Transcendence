import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { loginIdentifierSchema } from '../../zod/zod.schemas'

const signInSchema = z.object({
	identifier: loginIdentifierSchema,
	password: z.string("Please input a string").min(1, 'Password required'),	
})

export class SignInDto extends createZodDto(signInSchema) {}