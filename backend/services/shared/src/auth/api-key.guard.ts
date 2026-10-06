import { CanActivate, ExecutionContext, Inject, Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common'
import { createHash } from 'crypto'
import { InternalServiceClient, InternalServiceError } from '../http/internal-client'
import type { JwtPayload } from './jwt-payload'

export const API_KEY_AUTH_CLIENT = 'API_KEY_AUTH_CLIENT'
export const API_KEY_HEADER = 'x-api-key'

const CACHE_TTL_MS = 30_000
const CACHE_MAX_ENTRIES = 1000
const MAX_KEY_LENGTH = 256

type ApiKeyOwner = Pick<JwtPayload, 'sub' | 'username'>

@Injectable()
export class ApiKeyGuard implements CanActivate {
	private readonly logger = new Logger(ApiKeyGuard.name)
	private readonly cache = new Map<string, { owner: ApiKeyOwner; expiresAt: number }>()

	constructor(@Inject(API_KEY_AUTH_CLIENT) private readonly client: InternalServiceClient) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const raw: unknown = req.headers?.[API_KEY_HEADER]
		const key = typeof raw === 'string' ? raw.trim() : ''

		if (!key) {
			throw new UnauthorizedException('Missing API key')
		}
		if (key.length > MAX_KEY_LENGTH) {
			throw new UnauthorizedException('Invalid API key')
		}

		const owner = await this.resolve(key)
		if (!owner) {
			throw new UnauthorizedException('Invalid API key')
		}

		req.user = { sub: owner.sub, username: owner.username }
		return (true)
	}

	private async resolve(key: string): Promise<ApiKeyOwner | null> {
		const cacheKey = createHash('sha256').update(key).digest('hex')
		const cached = this.cache.get(cacheKey)

		if (cached && cached.expiresAt > Date.now()) {
			return (cached.owner)
		}
		this.cache.delete(cacheKey)

		let owner: ApiKeyOwner | null
		try {
			owner = await this.client.post<ApiKeyOwner>('/internal/api-keys/verify', { key })
		} catch (err) {
			if (err instanceof InternalServiceError) {
				this.logger.error(`api key verification failed (status ${err.status}): ${err.message}`)
				throw new ServiceUnavailableException('auth service unavailable', { cause: err })
			}
			throw err
		}

		if (owner) {
			this.remember(cacheKey, owner)
		}
		return (owner)
	}

	private remember(cacheKey: string, owner: ApiKeyOwner): void {
		if (this.cache.size >= CACHE_MAX_ENTRIES) {
			const oldest = this.cache.keys().next().value
			if (oldest !== undefined) {
				this.cache.delete(oldest)
			}
		}
		this.cache.set(cacheKey, { owner, expiresAt: Date.now() + CACHE_TTL_MS })
	}
}
