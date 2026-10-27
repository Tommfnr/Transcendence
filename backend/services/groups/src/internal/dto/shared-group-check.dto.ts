import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { idSchema } from '@pep/shared'

export const sharedGroupCheckSchema = z.object({
	userIds: z.array(idSchema).min(1),
	groupIds: z.array(idSchema).min(1).optional(),
})

export class SharedGroupCheckDto extends createZodDto(sharedGroupCheckSchema) {}
