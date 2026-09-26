// Main file : launches the app to wait on 0.0.0.0:3000

import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { ROUTES, attachUpgradeProxy, buildProxyMiddleware, createRouteProxies } from './proxy.middleware'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false })
	app.set('trust proxy', 1)
	const proxies = createRouteProxies()
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
