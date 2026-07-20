import { pgTable, serial, varchar, integer, pgEnum } from 'drizzle-orm/pg-core'

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

export const groupRoleEnum = pgEnum('role', ['admin', 'member'])

export const groups = pgTable('groups', {
	id:		serial('id').primaryKey(),
	name:	varchar('name', { length:50 }).notNull(),	
})

export const groupMembers = pgTable('group_members', {
	id:			serial('id').primaryKey(),
	groupId:	integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
	userId:		integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	role:		groupRoleEnum('role').notNull().default('member'),
})