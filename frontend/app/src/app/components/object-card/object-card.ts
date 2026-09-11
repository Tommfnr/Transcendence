import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StatusBadgeComponent } from "../status-badge/status-badge";

export type ObjectCardStatus = 'available' | 'lent';

@Component({
	selector: 'app-object-card',
	templateUrl: './object-card.html',
	imports: [StatusBadgeComponent],
})

export class ObjectCard {

	@Input({ required: true }) name!: string;
	@Input() imageUrl: string | null = null;
	@Input({ required: true }) status!: ObjectCardStatus;
	@Output() edit = new EventEmitter<void>();
	@Output() remove = new EventEmitter<void>();


	get classes(): string {
		const base =
			'bg-card rounded-card shadow-card flex flex-col'
		return `${base}`
	}

	get imageClasses(): string {
		const base = 
			'bg-muted rounded-t-card overflow-clip flex items-center justify-center h-[88px] md:h-[112px]'
		
		return `${base}`;
	}

}
