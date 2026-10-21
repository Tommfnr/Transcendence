import { LendingStatus } from './lending.model';

// One line of the My exchanges tab: a request I posted, or an offer I made on someone else's request.

export type ExchangeTone = 'attention' | 'waiting' | 'cancel' | 'closed';

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

export const TONE_ORDER: Record<ExchangeTone, number> = { attention: 0, waiting: 1, cancel: 2, closed: 3 };

export const LENDING_STATUS_DISPLAY: Record<LendingStatus, { label: string; tone: ExchangeTone }> = {
	// offer
	pending: { label: 'pending', tone: 'waiting' },
	// loan
	accepted: { label: 'accepted', tone: 'attention' },
	active: { label: 'borrowed', tone: 'attention' },
	awaiting_confirmation: { label: 'awaiting confirmation', tone: 'attention' },
	returned: { label: 'completed', tone: 'closed' },
	// late
	overdue: { label: 'overdue', tone: 'attention' },
	// no loan
	rejected: { label: 'declined', tone: 'cancel' },
	cancelled: { label: 'cancelled', tone: 'cancel' },
};
