import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { requireEnv } from '../config/env'
import { jwtPayloadSchema } from './jwt-payload'

@Injectable()
export class SharedAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest()
		const header: string | undefined = req.headers?.authorization
		const [scheme, token] = header?.split(' ') ?? []

		if (!token || scheme?.toLowerCase() !== 'bearer') {
			throw new UnauthorizedException('Missing or malformed Authorization header')
		}

		let decoded: unknown
		try {
			decoded = jwt.verify(token, requireEnv('JWT_SECRET'), { algorithms: ['HS256'] })
		} catch {
			throw new UnauthorizedException('Invalid or expired access token')
		}

		const parsed = jwtPayloadSchema.safeParse(decoded)
		if (!parsed.success) {
			throw new UnauthorizedException('Malformed token payload')
		}

		req.user = parsed.data
		return true
	}
}
