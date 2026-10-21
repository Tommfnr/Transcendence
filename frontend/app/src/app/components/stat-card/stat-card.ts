import { Component, Input } from '@angular/core';

export type StatTone = 'primary' | 'success';

/**
 * A counter on the dashboard: a number, what it counts, and whose it is.
 *
 * The tone is not decoration — it separates what people ask of you
 * (primary) from what they offer you (success). Don't pick it by taste.
 */
@Component({
	selector: 'app-stat-card',
	standalone: true,
	templateUrl: './stat-card.html',
})

export class StatCardComponent {
	@Input({ required: true }) icon!: string;
	@Input({ required: true }) count!: number;
	@Input({ required: true }) label!: string;
	@Input({ required: true }) sublabel!: string;
	@Input() tone: StatTone = 'primary';

	get containerClasses(): string {
		const base = 'flex items-center rounded-sm border px-1 py-2 shadow-card';
		const tones: Record<StatTone, string> = {
			primary: 'border-primary-border bg-primary-surface',
			success: 'border-success-border bg-success-surface',
		};
		return `${base} ${tones[this.tone]}`;
	}
}
