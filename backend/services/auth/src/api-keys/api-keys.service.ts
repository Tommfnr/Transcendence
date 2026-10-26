import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { createHash, randomBytes } from 'crypto'
import { apiKeys, users } from '../database/schema'
import { DB } from '../database/database.module'

export const API_KEY_PREFIX = 'pep_'
const PREFIX_DISPLAY_LENGTH = 12
const MAX_KEYS_PER_USER = 10

export interface ApiKeyView {
	id: number
	name: string
	prefix: string
	createdAt: Date
	lastUsedAt: Date | null
}

export interface CreatedApiKey extends ApiKeyView {
	key: string
}

export interface ApiKeyOwner {
	sub: number
	username: string
}

export function hashApiKey(key: string): string {
	return (createHash('sha256').update(key).digest('hex'))
}

const viewColumns = {
	id: apiKeys.id,
	name: apiKeys.name,
	prefix: apiKeys.prefix,
	createdAt: apiKeys.createdAt,
	lastUsedAt: apiKeys.lastUsedAt,
}

@Injectable()
export class ApiKeysService {
	constructor(@Inject(DB) private db: PostgresJsDatabase) {}

	async create(userId: number, name: string): Promise<CreatedApiKey> {
		const active = await this.db
			.select({ id: apiKeys.id })
			.from(apiKeys)
			.where(and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))

		if (active.length >= MAX_KEYS_PER_USER) {
			throw new ConflictException(`API key limit reached (${MAX_KEYS_PER_USER})`)
		}

		const key = `${API_KEY_PREFIX}${randomBytes(32).toString('base64url')}`
		const [row] = await this.db
			.insert(apiKeys)
			.values({
				userId,
				name,
				prefix: key.slice(0, PREFIX_DISPLAY_LENGTH),
				keyHash: hashApiKey(key),
			})
			.returning(viewColumns)

		return ({ ...row, key })
	}

	findAllForUser(userId: number): Promise<ApiKeyView[]> {
		return (this.db
			.select(viewColumns)
			.from(apiKeys)
			.where(and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
			.orderBy(desc(apiKeys.createdAt)))
	}

	async revoke(userId: number, id: number): Promise<void> {
		const revoked = await this.db
			.update(apiKeys)
			.set({ revokedAt: new Date() })
			.where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
			.returning({ id: apiKeys.id })

		if (revoked.length === 0) {
			throw new NotFoundException(`API key ${id} not found`)
		}
	}

	async verify(key: string): Promise<ApiKeyOwner | null> {
		if (!key.startsWith(API_KEY_PREFIX)) {
			return (null)
		}

		const [row] = await this.db
			.select({ id: apiKeys.id, sub: users.id, username: users.username })
			.from(apiKeys)
			.innerJoin(users, eq(users.id, apiKeys.userId))
			.where(and(eq(apiKeys.keyHash, hashApiKey(key)), isNull(apiKeys.revokedAt), isNull(users.deletedAt)))

		if (!row) {
			return (null)
		}

		await this.db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id))

		return ({ sub: row.sub, username: row.username })
	}
}
