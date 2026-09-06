import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { createHash, timingSafeEqual } from 'crypto'
import { requireEnv } from '../config/env'

@Injectable()
export class InternalAuthGuard implements CanActivate {
	private readonly logger = new Logger(InternalAuthGuard.name)
	private readonly expectedKey = requireEnv('INTERNAL_API_KEY')
	private readonly expectedHash = createHash('sha256').update(this.expectedKey).digest()

	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest()
		const header: string | undefined = req.headers?.authorization
		const [scheme, token] = header?.split(' ') ?? []

		if (!token || scheme?.toLowerCase() !== 'bearer') {
			this.reject(req, 'missing or malformed credentials')
			throw new UnauthorizedException('Missing or malformed internal credentials')
		}

		if (!this.matchesSecret(token)) {
			this.reject(req, 'invalid credentials')
			throw new UnauthorizedException('Invalid internal credentials')
		}

		return true
	}

	private matchesSecret(provided: string): boolean {
		const providedHash = createHash('sha256').update(provided).digest()

		return timingSafeEqual(providedHash, this.expectedHash)
	}

	private reject(req: { ip?: string; method?: string; url?: string }, reason: string): void {
		this.logger.warn(`Rejected internal request (${reason}) from ${req.ip ?? 'unknown'} ${req.method ?? ''} ${req.url ?? ''}`.trim())
	}
}
