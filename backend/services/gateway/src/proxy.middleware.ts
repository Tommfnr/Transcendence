import { Agent, type IncomingMessage } from 'http'
import type { Socket } from 'net'
import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { createProxyMiddleware, RequestHandler as ProxyRequestHandler } from 'http-proxy-middleware'
import { optionalEnv } from '@pep/shared'

export interface RouteEntry {
	prefix: string
	target: string
	ws?: boolean
	timeoutMs?: number
}

const upstreamAgent = new Agent({ keepAlive: true, maxSockets: 256 })

const DEFAULT_PROXY_TIMEOUT_MS = Number(optionalEnv('PROXY_TIMEOUT_MS', '30000'))

const CHATS_TARGET = optionalEnv('CHATS_SERVICE_URL', 'http://chats:3000')

export const ROUTES: RouteEntry[] = [
	{ prefix: '/api/auth', target: optionalEnv('AUTH_SERVICE_URL', 'http://auth:3000') },
	{ prefix: '/api/users', target: optionalEnv('USERS_SERVICE_URL', 'http://users:3000') },
	{ prefix: '/api/objects', target: optionalEnv('OBJECTS_SERVICE_URL', 'http://objects:3000') },
	{ prefix: '/api/public/v1/objects', target: optionalEnv('OBJECTS_SERVICE_URL', 'http://objects:3000') },
	{ prefix: '/api/groups', target: optionalEnv('GROUPS_SERVICE_URL', 'http://groups:3000') },
	{ prefix: '/api/lending', target: optionalEnv('LENDING_SERVICE_URL', 'http://lending:3000') },
	{ prefix: '/api/posts', target: optionalEnv('POSTS_SERVICE_URL', 'http://posts:3000') },
	{ prefix: '/api/chats', target: CHATS_TARGET },
	{ prefix: '/api/socket.io', target: CHATS_TARGET, ws: true, timeoutMs: 0 },
]

export function matchRoute(path: string, routes: RouteEntry[] = ROUTES): RouteEntry | undefined {
	return (routes.find((route) => path === route.prefix || path.startsWith(`${route.prefix}/`)))
}

export function createRouteProxies(routes: RouteEntry[] = ROUTES): Map<string, ProxyRequestHandler> {
	return (new Map<string, ProxyRequestHandler>(
		routes.map((route) => [
			route.prefix,
			createProxyMiddleware({
				target: route.target,
				changeOrigin: true,
				ws: route.ws === true,
				agent: upstreamAgent,
				proxyTimeout: route.timeoutMs ?? DEFAULT_PROXY_TIMEOUT_MS,
			}),
		]),
	))
}

export function buildProxyMiddleware(
	routes: RouteEntry[] = ROUTES,
	proxies: Map<string, ProxyRequestHandler> = createRouteProxies(routes),
): RequestHandler {
	return async (req: Request, res: Response, next: NextFunction) => {
		const route = matchRoute(req.path, routes)

		if (!route) {
			res.status(404).json({ statusCode: 404, message: 'Not found' })
			return
		}

		await proxies.get(route.prefix)!(req, res, next)
	}
}

export interface UpgradableServer {
	on(event: 'upgrade', listener: (req: IncomingMessage, socket: Socket, head: Buffer) => void): unknown
}

export function attachUpgradeProxy(
	server: UpgradableServer,
	routes: RouteEntry[] = ROUTES,
	proxies: Map<string, ProxyRequestHandler> = createRouteProxies(routes),
): void {
	server.on('upgrade', (req, socket, head) => {
		const route = matchRoute((req.url ?? '/').split('?')[0], routes)

		if (!route?.ws) {
			socket.destroy()
			return
		}

		proxies.get(route.prefix)!.upgrade!(req, socket, head)
	})
}
