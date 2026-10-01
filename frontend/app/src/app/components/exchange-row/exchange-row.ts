import { Component, booleanAttribute, computed, input, output } from '@angular/core';

export type ExchangeStatus = 'attention' | 'waiting' | 'done';

/**
 * One exchange you are part of — whether you asked or you offered.
 *
 * The role ("my request" / "my offer") lives in the subtitle text, not in
 * a variant: splitting the list by role would defeat the point of having
 * one place to look. Status is a variant because it changes the colour of
 * the right-hand label, and colour is what lets you scan without reading.
 */
@Component({
	selector: 'app-exchange-row',
	standalone: true,
	templateUrl: './exchange-row.html',
})
export class ExchangeRowComponent {
	readonly title = input.required<string>();
	readonly subtitle = input.required<string>();
	readonly statusLabel = input.required<string>();
	readonly status = input<ExchangeStatus>('waiting');
	readonly unread = input(false, { transform: booleanAttribute });
	readonly press = output<void>();

	readonly statusClasses = computed(() => {
		const base = 'text-xs font-bold whitespace-nowrap';
		const tones: Record<ExchangeStatus, string> = {
			attention: 'text-primary',
			waiting: 'text-text-secondary',
			done: 'text-success',
		};
		return `${base} ${tones[this.status()]}`;
	});
}
