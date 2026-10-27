import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { messageContentSchema, idSchema } from '@pep/shared'

export const createConversationSchema = z.object({
	recipientId:	idSchema,
	content:		messageContentSchema,
	postId:			idSchema,
})

export class CreateConversationDto extends createZodDto(createConversationSchema) {}
