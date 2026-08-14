// Creates the Drizzle over PostgreSQL client to talk to the DB

import { Module, Global } from '@nestjs/common'
import postgres = require('postgres')
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

const client = postgres({ // PostgreSQL Client
	host: process.env.POSTGRES_HOST ?? 'postgres',
	database: process.env.POSTGRES_DB,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
})

// Injection token, because Drizzle ORM is an external library, we need a way to talk to it that TypeScript understands 
export const DB = 'DB'

@Global()
@Module({
	providers: [{
		provide: DB,
		useValue: drizzle(client, { schema }), // Drizzle Client
	},],
	exports: [DB],
})
export class DatabaseModule {}