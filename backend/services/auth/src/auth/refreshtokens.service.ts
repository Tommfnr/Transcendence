import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { refreshTokens } from '../database/schema'
import { DB } from '../database/database.module'
import { eq, and } from 'drizzle-orm'

const TIME_TO_LIVE = 604800000

@Injectable()
export class RefreshTokensService {
	constructor(@Inject(DB) private db: PostgresJsDatabase) {}

	async issue(userId: number): Promise<{ jti: string }> {
		const jti = randomUUID()
		await this.db.insert(refreshTokens).values({
			jti,
			userId,
			expiresAt: new Date(Date.now() + TIME_TO_LIVE),
		})
		return { jti }
	}

	async findByJti(jti: string) {
		const [row] = await this.db.select().from(refreshTokens).where(eq(refreshTokens.jti, jti))
		return (row ?? null)
	}

	async revoke(jti: string): Promise<void> {
		await this.db.update(refreshTokens).set({ revoked: true, updatedAt: new Date() }).where(eq(refreshTokens.jti, jti))
	}

	async revokeAllForUser(userId: number): Promise<void> {
		await this.db.update(refreshTokens).set({ revoked: true, updatedAt: new Date() }).where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.revoked, false)))
	}
}
