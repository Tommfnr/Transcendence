import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const verifyApiKeySchema = z.object({
	key: z.string('Please input a string').min(1, 'Key required').max(256),
})

export class VerifyApiKeyDto extends createZodDto(verifyApiKeySchema) {}
