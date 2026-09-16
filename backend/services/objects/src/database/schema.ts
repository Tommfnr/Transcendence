import { pgTable, pgEnum, serial, varchar, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core'

const timestamptz = (name: string) => timestamp(name, { withTimezone: true })

export const objectConditionEnum = pgEnum('object_condition', ['new', 'good', 'worn'])

export const objectTypeEnum = pgEnum('object_type', ['Tools', 'Electronics', 'Vehicles', 'Outdoor & Recreation', 'Media', 'Events', 'Clothing & Gear'])

export const objects = pgTable('objects', {
	id:						serial('id').primaryKey(),
	name:					varchar('name', { length:30 }).notNull(),
	ownerId:			integer('owner_id').notNull(),
	type:					objectTypeEnum('type'),
	description:	varchar('description', { length:500 }),
	condition:		objectConditionEnum('condition').notNull(),
	isAvailable:	boolean('is_available').notNull().default(true),
	createdAt:		timestamptz('created_at').notNull().defaultNow(),
	updatedAt:		timestamptz('updated_at').notNull().defaultNow()
})

export const objectGroupGrants = pgTable('object_group_grants', {
	id:					serial('id').primaryKey(),
	objectId:		integer('object_id').notNull().references(() => objects.id, { onDelete: 'cascade' }),
	groupId:		integer('group_id').notNull(),
	grantedBy:	integer('granted_by').notNull(),
	createdAt:	timestamptz('created_at').notNull().defaultNow(),
	updatedAt:	timestamptz('updated_at').notNull().defaultNow()
}, (table) => ({
	uniqueObjectGroup: unique().on(table.objectId, table.groupId)
}))
