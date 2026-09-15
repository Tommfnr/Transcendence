import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { createProxyMiddleware, RequestHandler as ProxyRequestHandler } from 'http-proxy-middleware'
import { optionalEnv } from '@pep/shared'

export interface RouteEntry {
	prefix: string
	target: string
}

export const ROUTES: RouteEntry[] = [
	{ prefix: '/api/auth', target: optionalEnv('AUTH_SERVICE_URL', 'http://auth:3000') },
	{ prefix: '/api/users', target: optionalEnv('USERS_SERVICE_URL', 'http://users:3000') },
	{ prefix: '/api/objects', target: optionalEnv('OBJECTS_SERVICE_URL', 'http://objects:3000') },
	{ prefix: '/api/groups', target: optionalEnv('GROUPS_SERVICE_URL', 'http://groups:3000') },
	{ prefix: '/api/lending', target: optionalEnv('LENDING_SERVICE_URL', 'http://lending:3000') },
]

export function matchRoute(path: string, routes: RouteEntry[] = ROUTES): RouteEntry | undefined {
	return (routes.find((route) => path === route.prefix || path.startsWith(`${route.prefix}/`)))
}

export function buildProxyMiddleware(routes: RouteEntry[] = ROUTES): RequestHandler {
	const proxies = new Map<string, ProxyRequestHandler>(
		routes.map((route) => [route.prefix, createProxyMiddleware({ target: route.target, changeOrigin: true })]),
	)

	return async (req: Request, res: Response, next: NextFunction) => {
		const route = matchRoute(req.path, routes)

		if (!route) {
			res.status(404).json({ statusCode: 404, message: 'Not found' })
			return
		}

		await proxies.get(route.prefix)!(req, res, next)
	}
}
