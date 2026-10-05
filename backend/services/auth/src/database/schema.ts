import { pgTable, serial, varchar, customType, integer, boolean, timestamp, uuid } from 'drizzle-orm/pg-core'

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
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const refreshTokens = pgTable('refresh_tokens', {
	id: serial('id').primaryKey(),
	jti: uuid('jti').notNull().unique(),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // warn : ondelete cascade 
	revoked: boolean('revoked').notNull().default(false),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
