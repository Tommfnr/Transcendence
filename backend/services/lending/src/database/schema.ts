import { pgTable, pgEnum, serial, integer, timestamp } from 'drizzle-orm/pg-core'

const timestamptz = (name: string) => timestamp(name, { withTimezone: true })

export const lendingStatusEnum = pgEnum('lending_status',
	['pending', 'accepted', 'active', 'awaiting_confirmation',
		'returned', 'disputed', 'rejected', 'cancelled', 'overdue',
		'created'
	],
)

export const lending = pgTable('lending', {
	id:													serial('id').primaryKey(),
	objectId: 									integer('object_id').notNull(),
	lenderId: 									integer('lender_id').notNull(),
	borrowerId:									integer('borrower_id').notNull(),
	status:											lendingStatusEnum('status').notNull().default('created'),
	lendedFrom: 								timestamptz('lended_from').notNull(),
	lendedTo:										timestamptz('lended_to').notNull(),
	pickedUpAt:									timestamptz('picked_up_at'),
	borrowerReturnedAt: 				timestamptz('borrower_returned_at'),
	lenderConfirmedReturnedAt:	timestamptz('lender_confirmed_returned_at'),
	createdAt:									timestamptz('created_at').defaultNow(),
	updatedAt:									timestamptz('updated_at').defaultNow(),
})
