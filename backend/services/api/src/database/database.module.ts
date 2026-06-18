import { Module, Global } from '@nestjs/common'
import postgres = require('postgres')
import { drizzle } from 'drizzle-orm/postgres-js'
import { objects } from '../../schema'

const client = postgres({
	host: process.env.POSTGRES_HOST ?? 'postgres',
	database: process.env.POSTGRES_DB,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
})

export const DB = 'DB'

@Global()
@Module({
	providers: [{
		provide: DB,
		useValue: drizzle(client, { schema: { objects } }),
	},],
	exports: [DB],
})
export class DatabaseModule {}