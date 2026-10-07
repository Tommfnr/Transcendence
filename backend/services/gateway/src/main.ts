// Main file : launches the app to wait on 0.0.0.0:3000

import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import promBundle from 'express-prom-bundle'
import { AppModule } from './app.module'
import { ROUTES, attachUpgradeProxy, buildProxyMiddleware, createRouteProxies, matchRoute } from './proxy.middleware'
import { buildRateLimiter, loadRateLimitConfig, RateLimitConfig } from './rate-limiter'
import { buildDocsRouter } from './docs.router'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false })
	app.set('trust proxy', 1)
	const proxies = createRouteProxies()
	// exposes /metrics for Prometheus and times every request, tagged by which domain service it went to
	app.use(promBundle({
		includeMethod: true,
		includePath: false,
		customLabels: { service: 'unknown' },
		transformLabels: (labels, req) => {
			labels.service = matchRoute(req.path)?.prefix.replace('/api/', '') ?? 'unknown'
		},
	}))

	const RLConfig = loadRateLimitConfig()
	app.use('/api/public/docs', buildDocsRouter()) // exempt from rate limit
	app.use(RLConfig.prefix, buildRateLimiter(RLConfig))
	// gateway owns no routes : every request is forwarded to a domain service by path prefix
	app.use(buildProxyMiddleware(ROUTES, proxies))
	attachUpgradeProxy(app.getHttpServer(), ROUTES, proxies)
	app.getHttpServer().keepAliveTimeout = 125_000
	await app.listen(3000, '0.0.0.0')
}
void bootstrap().catch((err) => {
	console.error(err)
	process.exit(1)
})
