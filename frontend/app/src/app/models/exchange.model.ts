import { LendingStatus } from './lending.model';

// One line of the My exchanges tab: a request I posted, or an offer I made on someone else's request.

export type ExchangeTone = 'attention' | 'waiting' | 'done';

export interface Exchange {
	id: string;
	kind: 'request' | 'offer';
	postId: number;
	title: string;
	subtitle: string;
	statusLabel: string;
	tone: ExchangeTone;
	lendingId: number | null;
}

export const TONE_ORDER: Record<ExchangeTone, number> = { attention: 0, waiting: 1, done: 2 };

export const LENDING_STATUS_DISPLAY: Record<LendingStatus, { label: string; tone: ExchangeTone }> = {
	// offer
	created: { label: 'pending', tone: 'waiting' },
	pending: { label: 'pending', tone: 'waiting' },
	// loan
	accepted: { label: 'accepted', tone: 'attention' },
	active: { label: 'in progress', tone: 'attention' },
	awaiting_confirmation: { label: 'awaiting return', tone: 'attention' },
	returned: { label: 'completed', tone: 'done' },
	// problems
	overdue: { label: 'overdue', tone: 'attention' },
	disputed: { label: 'disputed', tone: 'attention' },
	// no loan
	rejected: { label: 'declined', tone: 'waiting' },
	cancelled: { label: 'cancelled', tone: 'waiting' },
};

/** A loan that went past the offer stage: the requester picked this helper. */
export const CHOSEN_STATUSES: LendingStatus[] = ['accepted', 'active', 'awaiting_confirmation', 'returned', 'overdue', 'disputed'];

