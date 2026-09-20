import { Component, Input } from '@angular/core';

export type RequestStatus = 'open' | 'pending' | 'done' | 'available' | 'lent';

/**
 * Communicates the state of a request. NOT a button.
 *
 * It replaces the call-to-action once the request is no longer actionable,
 * so it must not look or behave like something you can press: no cursor
 * change, no hover, and it is a <span>, so it is never focusable.
 */
@Component({
	selector: 'app-status-badge',
	standalone: true,
	template: `<span [class]="classes">{{ label }}</span>`,
})
export class StatusBadgeComponent {
	@Input({ required: true }) status!: Exclude<RequestStatus, 'open'>;

	private static readonly LABELS: Record<string, string> = {
		pending: 'Pending',
		done: 'Done',
		available: 'Available',
		lent: 'Lent'
	};

	get label(): string {
		return StatusBadgeComponent.LABELS[this.status] ?? this.status;
	}

	get classes(): string {
		const base =
			'inline-flex shrink-0 items-center justify-center rounded-card border bg-card px-2 py-1 text-xs font-bold';
		const tones: Record<string, string> = {
			pending: 'border-primary text-primary',
			done: 'border-success text-success',
			available: 'border-success text-success',
			lent: 'border-primary text-primary',
		};
		return `${base} ${tones[this.status] ?? tones['pending']}`;
	}
}
