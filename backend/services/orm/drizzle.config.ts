import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	schema: './schema.ts',
	dialect: 'postgresql', // Drizzle now knows the DB language it's going to communicate with
	dbCredentials: {
		host: process.env.POSTGRES_HOST!,
		database: process.env.POSTGRES_DB!,
		user: process.env.POSTGRES_USER!,
		password: process.env.POSTGRES_PASSWORD!,
		ssl: false,
	},
})