import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { idSchema } from '@pep/shared'

export const membershipCheckSchema = z.object({
	userId: idSchema,
	groupIds: z.array(idSchema).min(1),
})

export class MembershipCheckDto extends createZodDto(membershipCheckSchema) {}
