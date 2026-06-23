// This schema file is used by Drizzle to know the correct formats
// We could forget init.sql (used by DB) and just use this to create the tables, 
// but I think it's great to keep init.sql to create the tables before runtime, during the containers startup

import { isNotNull } from 'drizzle-orm'
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core'

export const objects = pgTable('objects', {
	id:			serial('id').primaryKey(),
	brand:	varchar('brand', { length:20 }).notNull(),
	owner:	varchar('owner', { length:20 }).notNull(),
	type:		varchar('type', { length:20 }).notNull()
})

export const users = pgTable('users', {
	id:	serial('id').primaryKey(),
	username: varchar('username').notNull(),
	h_password: varchar('h_password', { length: 255 }).notNull()
})