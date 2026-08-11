import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { groupNameSchema } from '../../zod/zod.schemas'

const createGroupSchema = z.object({
	name: 	groupNameSchema
})

export class CreateGroupDto extends createZodDto(createGroupSchema) {}