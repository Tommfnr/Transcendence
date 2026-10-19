import { pgTable, serial, integer, text, timestamp, unique } from 'drizzle-orm/pg-core'

const timestamptz = (name: string) => timestamp(name, { withTimezone: true })

export const conversations = pgTable('conversations', {
	id:				serial('id').primaryKey(),
	postId:			integer('post_id').notNull(),
	createdAt:		timestamptz('created_at').notNull().defaultNow(),
	updatedAt:		timestamptz('updated_at').notNull().defaultNow(),
})

export const conversationMembers = pgTable('conversation_members', {
	id:				serial('id').primaryKey(),
	conversationId:	integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
	userId:			integer('user_id').notNull(),
	createdAt:		timestamptz('created_at').notNull().defaultNow(),
	updatedAt:		timestamptz('updated_at').notNull().defaultNow(),
}, (table) => ({
	uniqueMembership: unique().on(table.conversationId, table.userId),
}))

export const messages = pgTable('messages', {
	id:					serial('id').primaryKey(),
	conversationId:		integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
	content:			text('content').notNull(),
	ownerId:			integer('owner_id').notNull(),
	createdAt:			timestamptz('created_at').notNull().defaultNow(),
	updatedAt:			timestamptz('updated_at').notNull().defaultNow(),
})
