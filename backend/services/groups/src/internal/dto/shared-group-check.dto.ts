import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const sharedGroupCheckSchema = z.object({
	userIds: z.array(z.number().int().positive()).min(1),
	groupIds: z.array(z.number().int().positive()).min(1).optional(),
})

export class SharedGroupCheckDto extends createZodDto(sharedGroupCheckSchema) {}
