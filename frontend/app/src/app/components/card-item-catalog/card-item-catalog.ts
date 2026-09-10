import { Component, Input } from '@angular/core';
import { StatusBadgeComponent } from "../status-badge/status-badge";

export type Display = 'mobile' | 'desktop';

@Component({
	selector: 'app-card-item-catalog',
	templateUrl: './card-item-catalog.html',
	imports: [StatusBadgeComponent],
})

export class CardItemCatalog {

	@Input() display: Display = 'mobile';

	get classes(): string { 
		const base =
		''

	const display: Record<Display, string> = {
		mobile: 'w-10',
		desktop: 'w-20',
	}
		return `${base} ${display[this.display]}`;
	}

}
