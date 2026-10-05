import { createObjectSchema } from './create-object.dto'
import { createZodDto } from 'nestjs-zod'

export const updateObjectSchema = createObjectSchema
	.partial()
	.refine((dto) => Object.keys(dto).length > 0, { message: 'At least one field must be provided '})

export class UpdateObjectDto extends createZodDto(updateObjectSchema) {}
