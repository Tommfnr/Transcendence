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
	template: `
		<div [class]="containerClasses">
			<div class="flex h-full items-center px-2">
				<img [src]="'/icons/' + icon + '.svg'" alt="" class="size-8" />
			</div>
			<div class="flex w-20 flex-col whitespace-nowrap text-text-strong">
				<span class="text-xl font-bold">{{ count }}</span>
				<span class="text-2xs font-semibold tracking-tight">{{ label }}</span>
				<span class="text-2xs font-light tracking-tight">{{ sublabel }}</span>
			</div>
		</div>
	`,
})
export class StatCardComponent {
	@Input({ required: true }) icon!: string;
	@Input({ required: true }) count!: number;
	@Input({ required: true }) label!: string;
	@Input({ required: true }) sublabel!: string;
	@Input() tone: StatTone = 'primary';

	get containerClasses(): string {
		const base = 'flex items-center rounded-sm border px-1 py-2 shadow-raised';
		const tones: Record<StatTone, string> = {
			primary: 'border-primary-border bg-primary-surface',
			success: 'border-success-border bg-success-surface',
		};
		return `${base} ${tones[this.tone]}`;
	}
}
