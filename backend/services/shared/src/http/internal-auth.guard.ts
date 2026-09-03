import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { createHash, timingSafeEqual } from 'crypto'
import { requireEnv } from '../config/env'

// this creates a new guard for internal routes 

@Injectable()
export class InternalAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest()
		const header: string | undefined = req.headers?.authorization
		const [scheme, token] = header?.split(' ') ?? []

		if (!token || scheme?.toLowerCase() !== 'bearer') {
			throw new UnauthorizedException('Missing or malformed internal credentials')
		}

		if (!matchesSecret(token, requireEnv('INTERNAL_API_KEY'))) {
			throw new UnauthorizedException('Invalid internal credentials')
		}

		return true
	}
}

function matchesSecret(provided: string, expected: string): boolean {
	const providedHash = createHash('sha256').update(provided).digest()
	const expectedHash = createHash('sha256').update(expected).digest()

	return timingSafeEqual(providedHash, expectedHash)
}
