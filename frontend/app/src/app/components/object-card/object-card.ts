import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StatusBadgeComponent } from "../status-badge/status-badge";
import { ObjectType, OBJECT_TYPES_EMOJI } from '../../models/object.model';

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

	@Input() type: ObjectType | null = null;

	get classes(): string {
		const base =
			'bg-card rounded-card shadow-card flex flex-col'
		return `${base}`
	}

	get imageClasses(): string {
		const base =
			'bg-[linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0.9)),url(/img/bg.png)] bg-cover bg-center rounded-t-card overflow-clip flex items-center justify-center h-[88px] md:h-[112px] '


		return `${base}`;
	}

	get emoji() {
		return this.type ? OBJECT_TYPES_EMOJI[this.type] : '📦';
	}

}
