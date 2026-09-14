// This schema file is used by Drizzle to know the correct formats
// We could forget init.sql (used by DB) and just use this to create the tables,
// but I think it's great to keep init.sql to create the tables before runtime, during the containers startup

import { pgTable, serial, varchar, customType, integer, pgEnum, boolean, timestamp, uuid, unique, text } from 'drizzle-orm/pg-core'

const citext = customType<{ data: string }>({
	dataType() {
		return ('citext');
	},
})

const timestamptz = (name: string) => timestamp(name, { withTimezone: true })

export const users = pgTable('users', {
	id:					serial('id').primaryKey(),
	username:		varchar('username').notNull(),
	email:			citext('email').notNull(),
	h_password: varchar('h_password', { length: 255 }).notNull()
})

export const objectConditionEnum = pgEnum('object_condition', ['new', 'good', 'worn'])

export const objectTypeEnum = pgEnum('object_type', ['Tools', 'Electronics', 'Vehicles', 'Outdoor & Recreation', 'Media', 'Events', 'Clothing & Gear'])

export const objects = pgTable('objects', {
	id:				serial('id').primaryKey(),
	name:			varchar('name', { length:30 }).notNull(),
    ownerId:		integer('owner_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
	type:			objectTypeEnum('type'),
	description:	varchar('description', { length:500 }),
	condition:		objectConditionEnum('condition').notNull(),
	isAvailable:	boolean('is_available').notNull(),
	createdAt:		timestamp('created_at').notNull().defaultNow(),
	updatedAt:		timestamp('updated_at').notNull().defaultNow()
})

export const groups = pgTable('groups', {
	id:				serial('id').primaryKey(),
	ownerId:		integer('owner_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
	name:			varchar('name', { length:30 }).notNull(),
	description:	varchar('description', { length:500 }),
	createdAt:		timestamp('created_at').notNull().defaultNow(),
	updatedAt:		timestamp('updated_at').notNull().defaultNow(),
});

export const groupRoleEnum = pgEnum('group_role', ['admin', 'member'])

export const groupMembers = pgTable('group_members', {
	id:				serial('id').primaryKey(),
	groupId:	integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
	userId:		integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	role:		groupRoleEnum('role').notNull().default('member'),
	createdAt:	timestamp('created_at').notNull().defaultNow(),
	updatedAt:	timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	uniqueMembership: unique().on(table.groupId, table.userId),
}));

export const postStatusEnum = pgEnum('post_status', ['open', 'closed'])

export const posts = pgTable('posts', {
	id: 			serial('id').primaryKey(),
	ownerId:	 	integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	title:			varchar('title', { length:60 }).notNull(),
	objectType:		objectTypeEnum('object_type'),
	description: 	varchar('description', { length:500 }),
	status: 		postStatusEnum('status').notNull().default('open'),
	createdAt: 		timestamp('created_at').defaultNow(),
	updatedAt: 		timestamp('updated_at').defaultNow(),
	fromDate: 		timestamp('from_date').notNull(),
	toDate: 		timestamp('to_date').notNull(),
})

export const conversations = pgTable('conversations', {
	id:				serial('id').primaryKey(),
	createdAt:		timestamp('created_at').notNull().defaultNow(),
	updatedAt:		timestamp('updated_at').notNull().defaultNow(),
});

export const conversationMembers = pgTable('conversation_members', {
	id:				serial('id').primaryKey(),
	conversationId:	integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
	userId:			integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	createdAt:		timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
	uniqueMembership: unique().on(table.conversationId, table.userId),
}));

export const messages = pgTable('messages', {
	id:					serial('id').primaryKey(),
	conversationId:		integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
	content:			text('content').notNull(),
	ownerId:			integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	createdAt:			timestamp('created_at').notNull().defaultNow(),
});

export const postGroups = pgTable('post_groups', {
	id:			serial('id').primaryKey(),
	postId:		integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
	groupId:	integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
}, (table) => ({
	uniquePostGroup: unique().on(table.postId, table.groupId),
}));

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
	lendedFrom: 								timestamptz('lended_from').notNull(),
	lendedTo:										timestamptz('lended_to').notNull(),
	pickedUpAt:									timestamptz('picked_up_at'),
	borrowerReturnedAt: 				timestamptz('borrower_returned_at'),
	lenderConfirmedReturnedAt:	timestamptz('lender_confirmed_returned_at'),
	createdAt:									timestamptz('created_at').defaultNow(),
	updatedAt:									timestamptz('updated_at').defaultNow(),
})
