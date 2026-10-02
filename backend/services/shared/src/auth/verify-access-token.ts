import * as jwt from 'jsonwebtoken'
import { requireEnv } from '../config/env'
import { JwtPayload, jwtPayloadSchema } from './jwt-payload'

export class InvalidAccessTokenError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'InvalidAccessTokenError'
	}
}

// Shared by the HTTP guard and non-HTTP transports (websockets) so every service checks tokens the same way
export function verifyAccessToken(token: string): JwtPayload {
	let decoded: unknown
	try {
		decoded = jwt.verify(token, requireEnv('JWT_SECRET'), { algorithms: ['HS256'] })
	} catch {
		throw new InvalidAccessTokenError('Invalid or expired access token')
	}

	const parsed = jwtPayloadSchema.safeParse(decoded)
	if (!parsed.success) {
		throw new InvalidAccessTokenError('Malformed token payload')
	}

	return (parsed.data)
}
