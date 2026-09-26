import { z } from 'zod'
import type { Request } from 'express'

export const jwtPayloadSchema = z.object({
	sub: z.number().int().positive(),
	username: z.string().min(1),
	iat: z.number().optional(),
	exp: z.number().optional(),
})

export type JwtPayload = z.infer<typeof jwtPayloadSchema>

export interface AuthenticatedRequest extends Request {
	user: JwtPayload
}
