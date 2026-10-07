import { Component } from '@angular/core';
import { TitleBarComponent } from '../../components/title-bar/title-bar';

@Component({
	selector: 'app-user-analytics',
	imports: [TitleBarComponent],
	templateUrl: './userAnalytics.html',
	styles: ``,
})
export class UserAnalytics {

	// TODO (wiring) lent, borrowed, requests
	readonly lendingStats = { lent: 3, borrowed: 2, requestsAnswered: 1};

	readonly donutSegments = [
		{ label: 'lent', value: this.lendingStats.lent, color: 'var(--color-primary)' },
		{ label: 'borrowed', value: this.lendingStats.borrowed, color: 'var(--color-secondary)' },
		{ label: 'offer made', value: this.lendingStats.requestsAnswered, color: 'var(--color-muted)' },
	];

	readonly donutGradient = this.buildGradient();

	// label: 3, borrowed: 2, requests: 1
	private buildGradient(): string {
		// reduce = reduce tab into one value, starts at 0. total = 0, =3, =5, =6
		const total = this.donutSegments.reduce((sum, s) => sum + s.value, 0);
		if (total === 0) return 'var(--color-muted)';
		let acc = 0;

		const stops = this.donutSegments.map((s) => {
			const from = (acc / total) * 100;
			acc += s.value;
			const to = (acc / total) * 100;
			return `${s.color} ${from}% ${to}%`;
		})
		// stops = [  'var(--color-primary) 0% 50%',   'var(--color-secondary) 50% 83.33%',  'var(--color-muted) 83.33% 100%']
		// conic-gradient(var(--color-primary) 0% 50%, ...)
		return `conic-gradient(${stops.join(', ')})`;
	}
}
