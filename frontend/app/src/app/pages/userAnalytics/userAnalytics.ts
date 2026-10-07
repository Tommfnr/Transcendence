import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { ObjectStats, PostStats, GroupStats, ChatStats, LendingStats } from '../../models/stats.model';
import { StatsService } from '../../services/stats.service';

@Component({
	selector: 'app-user-analytics',
	imports: [TitleBarComponent],
	templateUrl: './userAnalytics.html',
	styles: ``,
})
export class UserAnalytics implements OnInit {

	private statsService = inject(StatsService);

	objectStats = signal<ObjectStats>({
		total: 0,
		available: 0,
	});

	groupStats = signal<GroupStats>({
		total: 0,
		neighbours: 0,
	});

	postStats = signal<PostStats>({
		total: 0,
		open: 0,
		closed: 0,
		topCategory: null,
	});

	lendingStats = signal<LendingStats>({
		lent: 0,
		borrowed: 0,
		requestsAnswered: 0,
	});

	chatStats = signal<ChatStats>({
		conversations: 0,
		topDay: null,
	});

	readonly donutSegments = computed(() => {
		const stats = this.lendingStats();
		return [
			{ label: 'lent', value: stats.lent, color: 'var(--color-primary)' },
			{ label: 'borrowed', value: stats.borrowed, color: 'var(--color-secondary)' },
			{ label: 'offer made', value: stats.requestsAnswered, color: 'var(--color-success)' },
		];
	});

	readonly donutGradient = computed(() => this.buildGradient());

	readonly totalExchanges = computed(() => {
		const stats = this.lendingStats();
		return stats.lent + stats.borrowed;
	});

	private buildGradient(): string {
		const segments = this.donutSegments();

		// reduce = reduce tab into one value, starts at 0. total = 0, =3, =5, =6
		const total = segments.reduce((sum, s) => sum + s.value, 0);
		if (total === 0) return 'var(--color-muted)';
		let acc = 0;

		const stops = segments.map((s) => {
			const from = (acc / total) * 100;
			acc += s.value;
			const to = (acc / total) * 100;
			return `${s.color} ${from}% ${to}%`;
		})
		// stops = [  'var(--color-primary) 0% 50%',   'var(--color-secondary) 50% 83.33%',  'var(--color-muted) 83.33% 100%']
		// conic-gradient(var(--color-primary) 0% 50%, ...)
		return `conic-gradient(${stops.join(', ')})`;
	}

	ngOnInit():void {
		this.statsService.objectStats().subscribe((data) => {
			this.objectStats.set({
				total: data.total,
				available: data.available,
			});
		});
		this.statsService.groupStats().subscribe((data) => {
			this.groupStats.set({
				total: data.total,
				neighbours: data.neighbours,
			});
		});
		this.statsService.postStats().subscribe((data) => {
			this.postStats.set({
				total: data.total,
				open: data.open,
				closed: data.closed,
				topCategory: data.topCategory
			});
		});
		this.statsService.lendingStats().subscribe((data) => {
			this.lendingStats.set({
				lent: data.lent,
				borrowed: data.borrowed,
				requestsAnswered: data.requestsAnswered,
			});
		});
		this.statsService.chatStats().subscribe((data) => {
			this.chatStats.set({
				conversations: data.conversations,
				topDay: data.topDay,
			});
		});
	};
};
