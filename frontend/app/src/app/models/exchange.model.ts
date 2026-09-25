import { LendingStatus } from './lending.model';

// One line of the My exchanges tab: a request I posted, or an offer I made on someone else's request.

export type ExchangeTone = 'attention' | 'waiting' | 'done';

export interface Exchange {
	id: string;
	kind: 'request' | 'offer';
	postId: number;
	title: string;
	statusLabel: string;
	tone: ExchangeTone;
}

export const TONE_ORDER: Record<ExchangeTone, number> = { attention: 0, waiting: 1, done: 2 };

export const OFFER_STATUS: Record<LendingStatus, { label: string; tone: ExchangeTone }> = {
	created: { label: 'pending', tone: 'waiting' },
	pending: { label: 'pending', tone: 'waiting' },
	accepted: { label: 'accepted', tone: 'attention' },
	active: { label: 'in progress', tone: 'attention' },
	awaiting_confirmation: { label: 'awaiting return', tone: 'attention' },
	overdue: { label: 'overdue', tone: 'attention' },
	disputed: { label: 'disputed', tone: 'attention' },
	returned: { label: 'completed', tone: 'done' },
	rejected: { label: 'declined', tone: 'waiting' },
	cancelled: { label: 'cancelled', tone: 'waiting' },
};
