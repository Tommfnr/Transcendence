import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { messageContentSchema } from '../../zod/zod.schemas'

const createConversationSchema = z.object({
	postId:		z.number().int().positive(),
	content:	messageContentSchema,
})

export class CreateConversationDto extends createZodDto(createConversationSchema) {}
