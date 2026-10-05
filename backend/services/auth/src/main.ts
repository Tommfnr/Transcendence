import * as dotenv from 'dotenv'
dotenv.config()

import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import cookieParser from 'cookie-parser'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)
	app.set('trust proxy', 1)
	app.use(cookieParser())
	app.setGlobalPrefix('api', { exclude: ['internal/*path'] })
	app.getHttpServer().keepAliveTimeout = 65_000
	await app.listen(3000, '0.0.0.0')
}
void bootstrap().catch((err) => {
	console.error(err)
	process.exit(1)
})
