// This schema file is used by Drizzle to know the correct formats
// We could forget init.sql (used by DB) and just use this to create the tables, 
// but I think it's great to keep init.sql to create the tables before runtime, during the containers startup

import { pgTable, serial, varchar, customType, integer, pgEnum, boolean, timestamp, unique } from 'drizzle-orm/pg-core'

const citext = customType<{ data: string }>({
	dataType() {
		return ('citext');
	},
})

export const users = pgTable('users', {
	id:			serial('id').primaryKey(),
	username:	varchar('username').notNull(),
	email:		citext('email').notNull(),
	h_password: varchar('h_password', { length: 255 }).notNull()
})

export const objects = pgTable('objects', {
	id:				serial('id').primaryKey(),
	brand:			varchar('brand', { length:20 }).notNull(),
    ownerId:		integer('owner_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
	type:			varchar('type', { length:20 }).notNull(),
	description:	varchar('description', { length:500 }),
	isAvailable:	boolean('is_available').default(true),
	createdAt:		timestamp('created_at').defaultNow(),
	updatedAt:		timestamp('updated_at').defaultNow()
})

export const groups = pgTable('groups', {
	id:			serial('id').primaryKey(),
	ownerId:	integer('owner_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
	name:		varchar('name', { length:50 }).notNull(),
}, (table) => ({
	uniqueOwnerName: unique().on(table.ownerId, table.name),
}));

export const groupRoleEnum = pgEnum('group_role', ['admin', 'member'])

export const groupMembers = pgTable('group_members', {
	id:			serial('id').primaryKey(),
	groupId:	integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
	userId:		integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	role:		groupRoleEnum('role').notNull().default('member'),
}, (table) => ({
	uniqueMembership: unique().on(table.groupId, table.userId),
}));

export const groupObjectGrants = pgTable('group_object_grants', {
	id:					serial('id').primaryKey(),
	groupId:			integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
	objectId:			integer('object_id').notNull().references(() => objects.id, { onDelete: 'cascade' }),
	grantedBy:			integer('granted_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
}, (table) => ({
	uniqueGroupObjectGrant: unique().on(table.groupId, table.objectId),
}));
