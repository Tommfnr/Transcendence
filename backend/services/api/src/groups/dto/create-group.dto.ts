import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema } from '../../zod/zod.schemas'

const createGroupSchema = z.object({
	name:			nameSchema(30),
	description:	descriptionSchema
})

export class CreateGroupDto extends createZodDto(createGroupSchema) {}