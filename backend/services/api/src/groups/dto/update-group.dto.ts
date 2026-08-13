import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { groupNameSchema } from '../../auth/dto/zod.schemas'

const updateGroupSchema = z.object({
	name: 	groupNameSchema
})

export class UpdateGroupDto extends createZodDto(updateGroupSchema) {}
