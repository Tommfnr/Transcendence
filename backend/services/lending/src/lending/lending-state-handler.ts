import { lendingStatusEnum } from '../database/schema'
import { ConflictException } from '@nestjs/common'

type LendStatus = typeof lendingStatusEnum.enumValues[number]

const ALLOWED_TRANSITIONS: Record<LendStatus, LendStatus[]> = {
	// An offer waiting for the requester's answer
	pending: ['accepted', 'rejected', 'cancelled'],
	// Loan agreed, object not picked up yet
	accepted: ['active', 'cancelled'],
	// Object with the borrower
	active: ['awaiting_confirmation', 'overdue'],
	overdue: ['awaiting_confirmation', 'disputed'],
	// The borrower says it is back, the lender checks it
	awaiting_confirmation: ['returned', 'disputed'],
	// Final states
	returned: [],
	rejected: [],
	cancelled: [],
	disputed: [],
	created: [],
}

export function canTransition(from: LendStatus, to: LendStatus): boolean {
	return (ALLOWED_TRANSITIONS[from].includes(to))
}

export function assertTransition(from: LendStatus, to: LendStatus): void {
	if (!canTransition(from, to)) {
		throw new ConflictException(`A loan cannot go from ${from} to ${to}`)
	}
}
