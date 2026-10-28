import { Module, Global } from '@nestjs/common'
import postgres = require('postgres')
import { drizzle } from 'drizzle-orm/postgres-js'
import { requireEnv } from '@pep/shared'
import * as schema from './schema'

const client = postgres({
	host: process.env.POSTGRES_HOST ?? 'postgres',
	database: requireEnv('POSTGRES_DB'),
	user: requireEnv('POSTGRES_USER'),
	password: requireEnv('POSTGRES_PASSWORD'),
})

export const DB = 'DB'

@Global()
@Module({
	providers: [{
		provide: DB,
		useValue: drizzle(client, { schema }),
	}],
	exports: [DB],
})
export class DatabaseModule {}
