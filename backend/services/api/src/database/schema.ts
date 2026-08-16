// This schema file is used by Drizzle to know the correct formats
// We could forget init.sql (used by DB) and just use this to create the tables,
// but I think it's great to keep init.sql to create the tables before runtime, during the containers startup

import { pgTable, serial, varchar, customType, integer, pgEnum, boolean, timestamp, uuid } from 'drizzle-orm/pg-core'

const citext = customType<{ data: string }>({
	dataType() {
		return ('citext');
	},
})

const timestamptz = (name: string) => timestamp(name, { withTimezone: true })

export const objects = pgTable('objects', {
	id:						serial('id').primaryKey(),
	brand:				varchar('brand', { length:20 }).notNull(),
  ownerId:			integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	type:					varchar('type', { length:20 }).notNull(),
	description:	varchar('description', { length:500 }),
	condition:		varchar('condition', { length:50 }),
	isAvailable:	boolean('is_available').default(true),
	createdAt:		timestamp('created_at').defaultNow(),
	updatedAt:		timestamp('updated_at').defaultNow()
})

export const users = pgTable('users', {
	id:					serial('id').primaryKey(),
	username:		varchar('username').notNull(),
	email:			citext('email').notNull(),
	h_password: varchar('h_password', { length: 255 }).notNull()
})

export const groupRoleEnum = pgEnum('role', ['admin', 'member'])

export const groups = pgTable('groups', {
	id:			serial('id').primaryKey(),
	name:		varchar('name', { length:50 }).notNull(),
})

export const groupMembers = pgTable('group_members', {
	id:				serial('id').primaryKey(),
	groupId:	integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
	userId:		integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	role:			groupRoleEnum('role').notNull().default('member'),
})

export const refreshTokens = pgTable('refresh_tokens', {
	id: 				serial('id').primaryKey(),
	jti: 				uuid('jti').notNull().unique(),
	userId: 		integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	revoked: 		boolean('revoked').notNull().default(false),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const lendingStatusEnum = pgEnum('lending_status', 
	['pending', 'accepted', 'active', 'awaiting_confirmation',
		'returned', 'disputed', 'rejected', 'cancelled', 'overdue',
		'created'
	],
)

export const lending = pgTable('lending', {
	id:													serial('id').primaryKey(),
	objectId: 									integer('object_id').notNull().references(() => objects.id, { onDelete: 'cascade' }),
	lenderId: 									integer('lender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	borrowerId:									integer('borrower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	status:											lendingStatusEnum('status').notNull().default('created'),
	lendedFrom: 								timestamptz('lended_from'),
	lendedTo:										timestamptz('lended_to'),
	pickedUpAt:									timestamptz('picked_up_at'),
	borrowerReturnedAt: 				timestamptz('borrower_returned_at'),
	lenderConfirmedReturnedAt:	timestamptz('lender_confirmed_returned_at'),
	createdAt:									timestamptz('created_at').defaultNow(),
	updatedAt:									timestamptz('updated_at').defaultNow(),
})