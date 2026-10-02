import { Component, EventEmitter, Input, Output } from '@angular/core';
export type ChipTone = 'white' | 'field' | 'complementary';

@Component({
	selector: 'app-chip',
	standalone: true,
	templateUrl: './chip.html',
})

export class ChipComponent {
	@Input({ required: true }) label!: string;
	@Input() emoji?: string;
	@Input() selected = false;
	@Input() tone: ChipTone = 'white';
	@Output() pick = new EventEmitter<void>();

	get classes(): string {
		const base =
			'inline-flex h-8 items-center gap-1 rounded-full px-3 py-2 text-xs font-bold whitespace-nowrap cursor-pointer border border-strong';

		if (this.selected) {
			const selected: Record<ChipTone, string> = {
				white: 'bg-primary text-on-primary',
				field: 'bg-primary text-on-primary',
				complementary: 'bg-complementary-surface ring-1 ring-complementary text-complementary'
			}
			return `${base} ${selected[this.tone]}`;
		}

		const surface: Record<ChipTone, string> = {
			white: 'bg-card',
			field: 'bg-field-surface',
			complementary: 'bg-field-surface'
		};
		return `${base} ${surface[this.tone]} text-text-secondary`;
	}

}