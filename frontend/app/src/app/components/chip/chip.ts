import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chip',
  standalone: true,
  templateUrl: './chip.html',
})
export class ChipComponent {
	@Input({ required: true }) label!: string;
	@Input() emoji?: string;
	@Input() selected = false;

	get classes(): string {
		const base =
			'inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-bold whitespace-nowrap';

		return this.selected
			? `${base} bg-primary text-on-primary`
			: `${base} border border-text-secondary bg-card text-text-strong`;
	}
}