import { pgTable, pgEnum, serial, varchar, integer, timestamp, unique } from 'drizzle-orm/pg-core'

const timestamptz = (name: string) => timestamp(name, { withTimezone: true })

export const groupRoleEnum = pgEnum('group_role', ['admin', 'member'])

export const groups = pgTable('groups', {
	id:						serial('id').primaryKey(),
	ownerId:			integer('owner_id').notNull(),
	name:					varchar('name', { length:30 }).notNull(),
	description:	varchar('description', { length:500 }),
	createdAt:		timestamptz('created_at').notNull().defaultNow(),
	updatedAt:		timestamptz('updated_at').notNull().defaultNow(),
})

export const groupMembers = pgTable('group_members', {
	id:						serial('id').primaryKey(),
	groupId:			integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
	userId:				integer('user_id').notNull(),
	role:					groupRoleEnum('role').notNull().default('member'),
	createdAt:		timestamptz('created_at').notNull().defaultNow(),
	updatedAt:		timestamptz('updated_at').notNull().defaultNow(),
}, (table) => ({
	uniqueMembership: unique().on(table.groupId, table.userId),
}))
