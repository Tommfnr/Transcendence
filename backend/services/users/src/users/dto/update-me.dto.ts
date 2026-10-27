import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { usernameSchema } from '@pep/shared'

const updateMeSchema = z.object({
	username: usernameSchema,
})

export class UpdateMeDto extends createZodDto(updateMeSchema) {}
