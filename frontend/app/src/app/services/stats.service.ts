import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatStats, GroupStats, LendingStats, ObjectStats, PostStats } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
	private http = inject(HttpClient);

	objectStats(): Observable<ObjectStats> {
		return this.http.get<ObjectStats>('/api/objects/stats');
	}

	postStats(): Observable<PostStats> {
		return this.http.get<PostStats>('/api/posts/stats');
	}

	groupStats(): Observable<GroupStats> {
		return this.http.get<GroupStats>('/api/groups/stats');
	}

	chatStats(): Observable<ChatStats> {
		return this.http.get<ChatStats>('/api/chats/stats');
	}

	lendingStats(): Observable<LendingStats> {
		return this.http.get<LendingStats>('/api/lending/stats');
	}
}
