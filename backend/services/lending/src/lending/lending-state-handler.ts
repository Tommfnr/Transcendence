import { lendingStatusEnum } from '../database/schema'

type LendStatus = typeof lendingStatusEnum.enumValues[number]

const ALLOWED_TRANSITIONS: Record<LendStatus, LendStatus[]> = {
	pending: ['accepted', 'rejected', 'cancelled'],
	accepted: ['active', 'cancelled', 'returned'],
	active: ['awaiting_confirmation', 'overdue', 'disputed', 'returned'],
	awaiting_confirmation: ['returned', 'disputed'],
	overdue: ['awaiting_confirmation', 'disputed', 'returned'],
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
		throw new Error(`Illegal status transaction: ${from} -> ${to}`)
	}
}
