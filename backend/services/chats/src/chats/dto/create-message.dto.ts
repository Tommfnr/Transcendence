import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { messageContentSchema } from '@pep/shared'

export const createMessageSchema = z.object({
	content: messageContentSchema,
})

export class CreateMessageDto extends createZodDto(createMessageSchema) {}
