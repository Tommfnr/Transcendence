import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	schema: './services/*/src/database/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		host: process.env.POSTGRES_HOST!,
		database: process.env.POSTGRES_DB!,
		user: process.env.POSTGRES_USER!,
		password: process.env.POSTGRES_PASSWORD!,
		ssl: false,
	},
})