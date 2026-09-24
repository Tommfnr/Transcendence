import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { InvalidAccessTokenError, verifyAccessToken } from './verify-access-token'

@Injectable()
export class SharedAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest()
		const header: string | undefined = req.headers?.authorization
		const [scheme, token] = header?.split(' ') ?? []

		if (!token || scheme?.toLowerCase() !== 'bearer') {
			throw new UnauthorizedException('Missing or malformed Authorization header')
		}

		try {
			req.user = verifyAccessToken(token)
		} catch (err) {
			if (err instanceof InvalidAccessTokenError) {
				throw new UnauthorizedException(err.message)
			}
			throw err
		}

		return true
	}
}
