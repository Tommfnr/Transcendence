import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const createMessageSchema = z.object({
	content:	z.string().min(1, 'Message required').max(2000, 'Max 2000 characters'),
})

export class CreateMessageDto extends createZodDto(createMessageSchema) {}
