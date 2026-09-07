import { Component, EventEmitter, Input, Output } from '@angular/core';
export type ChipTone = 'white' | 'field';

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
			'inline-flex h-8 items-center gap-1 rounded-full px-3 py-2 text-xs font-bold whitespace-nowrap cursor-pointer border border-text-strong';

		if (this.selected)
			return `${base} bg-primary text-on-primary`;

		const surface: Record<ChipTone, string> = {
			white: 'bg-card',
			field: 'bg-field-surface',
		};
		return `${base} ${surface[this.tone]} text-text-secondary`;
	}
}