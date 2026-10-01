import { pgTable, pgEnum, serial, varchar, integer, timestamp, unique } from 'drizzle-orm/pg-core'

const timestamptz = (name: string) => timestamp(name, { withTimezone: true })

export const objectTypeEnum = pgEnum('object_type', ['DIY', 'Electronics', 'Leisure', 'Other'])

export const postStatusEnum = pgEnum('post_status', ['open', 'closed'])

export const posts = pgTable('posts', {
	id:						serial('id').primaryKey(),
	ownerId:			integer('owner_id').notNull(),
	title:				varchar('title', { length:60 }).notNull(),
	objectType:		objectTypeEnum('object_type'),
	description:	varchar('description', { length:500 }),
	status:				postStatusEnum('status').notNull().default('open'),
	createdAt:		timestamptz('created_at').defaultNow(),
	updatedAt:		timestamptz('updated_at').defaultNow(),
	fromDate:			timestamptz('from_date').notNull(),
	toDate:				timestamptz('to_date').notNull(),
})

export const postGroups = pgTable('post_groups', {
	id:				serial('id').primaryKey(),
	postId:		integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
	groupId:	integer('group_id').notNull(),
}, (table) => ({
	uniquePostGroup: unique().on(table.postId, table.groupId),
}))
