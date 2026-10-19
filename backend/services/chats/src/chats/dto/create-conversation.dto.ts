import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { messageContentSchema } from '@pep/shared'

export const createConversationSchema = z.object({
	recipientId:	z.number().int().positive(),
	content:		messageContentSchema,
	postId:			z.number().int().positive(),
})

export class CreateConversationDto extends createZodDto(createConversationSchema) {}
