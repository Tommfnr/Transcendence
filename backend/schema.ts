// This schema file is used by Drizzle to know the correct formats
// We could forget init.sql (used by DB) and just use this to create the tables,
// but I think it's great to keep init.sql to create the tables before runtime, during the containers startup

import { pgTable, serial, varchar, customType, integer, pgEnum, boolean, timestamp } from 'drizzle-orm/pg-core'

const citext = customType<{ data: string }>({
	dataType() {
		return ('citext');
	},
})

export const objects = pgTable('objects', {
	id:				serial('id').primaryKey(),
	brand:			varchar('brand', { length:20 }).notNull(),
    ownerId:		integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	type:			varchar('type', { length:20 }).notNull(),
	description:	varchar('description', { length:500 }),
	condition:		varchar('condition', { length:50 }),
	isAvailable:	boolean('is_available').default(true),
	createdAt:		timestamp('created_at').defaultNow(),
	updatedAt:		timestamp('updated_at').defaultNow()
})

export const users = pgTable('users', {
	id:			serial('id').primaryKey(),
	username:	varchar('username').notNull(),
	email:		citext('email').notNull(),
	h_password: varchar('h_password', { length: 255 }).notNull()
})

export const groupRoleEnum = pgEnum('role', ['admin', 'member'])

export const groups = pgTable('groups', {
	id:			serial('id').primaryKey(),
	name:		varchar('name', { length:50 }).notNull(),
})

export const groupMembers = pgTable('group_members', {
	id:			serial('id').primaryKey(),
	groupId:	integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
	userId:		integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	role:		groupRoleEnum('role').notNull().default('member'),
})
