import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { messageContentSchema } from '../../zod/zod.schemas'

const createMessageSchema = z.object({
	content: messageContentSchema,
})

export class CreateMessageDto extends createZodDto(createMessageSchema) {}
