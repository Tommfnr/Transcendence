export interface ObjectStats {
	total: number;
	available: number;
}

export interface PostStats {
	total: number;
	open: number;
	closed: number;
	topCategory: string | null;
}

export interface GroupStats {
	total: number;
	neighbours: number;
}

export interface ChatStats {
	conversations: number;
	topDay: string | null;
}

export interface LendingStats {
	lent: number;
	borrowed: number;
	requestsAnswered: number;
}