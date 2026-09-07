import { pgTable, pgEnum, serial, varchar, integer } from 'drizzle-orm/pg-core'

export const groupRoleEnum = pgEnum('role', ['admin', 'member'])

export const groups = pgTable('groups', {
	id:			serial('id').primaryKey(),
	name:		varchar('name', { length:50 }).notNull(),
})

export const groupMembers = pgTable('group_members', {
	id:				serial('id').primaryKey(),
	groupId:	integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
	userId:		integer('user_id').notNull(),
	role:			groupRoleEnum('role').notNull().default('member'),
})