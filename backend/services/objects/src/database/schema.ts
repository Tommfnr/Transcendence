import { pgTable, pgEnum, serial, varchar, integer, boolean, timestamp} from 'drizzle-orm/pg-core'

const timestamptz = (name: string) => timestamp(name, { withTimezone: true })

export const objectConditionEnum = pgEnum('object_condition', ['new', 'good', 'worn'])

export const objectTypeEnum = pgEnum('object_type', ['DIY', 'Electronics', 'Leisure', 'Other'])

export const objects = pgTable('objects', {
	id:						serial('id').primaryKey(),
	name:					varchar('name', { length:30 }).notNull(),
	ownerId:			integer('owner_id').notNull(),
	type:					objectTypeEnum('type'),
	description:	varchar('description', { length:500 }),
	condition:		objectConditionEnum('condition').notNull(),
	isAvailable:	boolean('is_available').notNull().default(true),
	createdAt:		timestamptz('created_at').notNull().defaultNow(),
	updatedAt:		timestamptz('updated_at').notNull().defaultNow(),
	deletedAt:		timestamptz('deleted_at'),
})
