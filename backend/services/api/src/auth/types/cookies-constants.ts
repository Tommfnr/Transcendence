import { CookieOptions } from 'express'

export const REFRESH_COOKIE_NAME = 'refresh_token'

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
	httpOnly: true,
	secure: true, // adds TLS
	sameSite: 'strict',
	path: '/api/auth', // cookie only sent when calling this type of endpoint
	maxAge: 604800000,
}