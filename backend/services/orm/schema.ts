import { pgTable, serial, varchar } from 'drizzle-orm/pg-core'

export const objects = pgTable('objects', {
	id:			serial('id').primaryKey(),
	brand:	varchar('brand', { length:20 }).notNull(),
	owner:	varchar('owner', { length:20 }).notNull(),
	type:		varchar('type', { length:20 }).notNull()
})