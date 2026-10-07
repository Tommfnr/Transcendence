import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const createApiKeySchema = z.object({
	name: z.string('Please input a string').trim().min(1, 'Name required').max(50, 'Name must be at most 50 characters'),
})

export class CreateApiKeyDto extends createZodDto(createApiKeySchema) {}
