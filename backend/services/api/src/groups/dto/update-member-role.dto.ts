import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const updateMemberRoleSchema = z.object({
	role: z.enum(['admin', 'member']),
})

export class UpdateMemberRoleDto extends createZodDto(updateMemberRoleSchema) {}
