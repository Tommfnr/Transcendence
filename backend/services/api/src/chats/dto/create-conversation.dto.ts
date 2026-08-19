import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const createConversationSchema = z.object({
	postId:		z.number().int().positive(),
	content:	z.string().min(1, 'Message required').max(2000, 'Max 2000 characters'),
})

export class CreateConversationDto extends createZodDto(createConversationSchema) {}
