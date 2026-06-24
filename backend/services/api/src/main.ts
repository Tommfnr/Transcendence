// Main file : launches the app to wait on 0.0.0.0:3000

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api') // Any calls to this app will be made through /api/ routes so we can put this here to avoid repeating 
	await app.listen(3000, '0.0.0.0')
}
bootstrap() // This is what launches everything