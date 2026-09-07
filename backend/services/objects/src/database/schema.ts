import { pgTable, serial, varchar, integer, boolean, timestamp} from 'drizzle-orm/pg-core'

const timestamptz = (name: string) => timestamp(name, { withTimezone: true })

export const objects = pgTable('objects', {
	id:						serial('id').primaryKey(),
	brand:				varchar('brand', { length:20 }).notNull(),
  ownerId:			integer('owner_id').notNull(),
	type:					varchar('type', { length:20 }).notNull(),
	description:	varchar('description', { length:500 }),
	condition:		varchar('condition', { length:50 }),
	isAvailable:	boolean('is_available').notNull().default(true),
	createdAt:		timestamptz('created_at').defaultNow(),
	updatedAt:		timestamptz('updated_at').defaultNow()
})