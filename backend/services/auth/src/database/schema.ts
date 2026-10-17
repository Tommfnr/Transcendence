import { pgTable, serial, varchar, customType, integer, boolean, timestamp, uuid } from 'drizzle-orm/pg-core'

const timestamptz = (name: string) => timestamp(name, { withTimezone: true }) 

const citext = customType<{ data: string }>({
	dataType() {
		return ('citext')
	},
})

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	username: varchar('username').notNull().unique(),
	email: citext('email').notNull(),
	h_password: varchar('h_password', { length: 255 }).notNull(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow(),
	deletedAt: timestamptz('deleted_at'),
})

export const refreshTokens = pgTable('refresh_tokens', {
	id: serial('id').primaryKey(),
	jti: uuid('jti').notNull().unique(),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // warn : ondelete cascade 
	revoked: boolean('revoked').notNull().default(false),
	expiresAt: timestamptz('expires_at').notNull(),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
	updatedAt: timestamptz('updated_at').notNull().defaultNow(),
})

export const apiKeys = pgTable('api_keys', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 50 }).notNull(),
	prefix: varchar('prefix', { length: 16 }).notNull(),
	keyHash: varchar('key_hash', { length: 64 }).notNull().unique(),
	lastUsedAt: timestamptz('last_used_at'),
	revokedAt: timestamptz('revoked_at'),
	createdAt: timestamptz('created_at').notNull().defaultNow(),
})
