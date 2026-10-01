import { createZodDto } from 'nestjs-zod'
import { envelopeSchema } from './envelope'

export class EventEnvelopeDto extends createZodDto(envelopeSchema) {}
