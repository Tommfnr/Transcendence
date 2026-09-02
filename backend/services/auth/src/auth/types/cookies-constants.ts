import { CookieOptions } from 'express'

export const REFRESH_COOKIE_NAME = 'refresh_token'

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: 'strict',
	path: '/api/auth',
	maxAge: 604800000,
}
