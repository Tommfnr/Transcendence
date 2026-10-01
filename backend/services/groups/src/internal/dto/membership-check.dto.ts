import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

export const membershipCheckSchema = z.object({
	userId: z.number().int().positive(),
	groupIds: z.array(z.number().int().positive()).min(1),
})

export class MembershipCheckDto extends createZodDto(membershipCheckSchema) {}
