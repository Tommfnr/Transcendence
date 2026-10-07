import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit'
import { optionalEnv } from '@pep/shared'

export interface RateLimitConfig {
	prefix: string
	limit: number
	windowMs: number
}

function positiveIntEnv(name: string, fallback: number): number {
	const parsed = Number(optionalEnv(name, String(fallback)))

	if (!Number.isInteger(parsed) || parsed <= 0) {
					throw new Error(`Environment variable ${name} must be a positive integer`)
	}
	return (parsed)
}

export function loadRateLimitConfig(): RateLimitConfig {
	return ({
					prefix: '/api/public',
					limit: positiveIntEnv('PUBLIC_API_RATE_LIMIT', 60),
					windowMs: positiveIntEnv('PUBLIC_API_RATE_WINDOW_MS', 60_000),
	})
}

export function buildRateLimiter(config: RateLimitConfig = loadRateLimitConfig()): RateLimitRequestHandler {
	return (rateLimit({
					windowMs: config.windowMs,
					limit: config.limit,
					standardHeaders: 'draft-6',
					legacyHeaders: false,
					handler: (_req, res, _next, options) => {
									res.status(options.statusCode).json({
													statusCode: options.statusCode,
													message: 'Too many requests, please try again later',
									})
					},
	}))
}