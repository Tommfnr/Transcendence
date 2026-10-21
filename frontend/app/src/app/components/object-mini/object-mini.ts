import { Component, booleanAttribute, computed, input, output } from '@angular/core';
import { ObjectType, OBJECT_TYPES_EMOJI } from '../../models/object.model';

@Component({
	selector: 'app-object-mini',
	standalone: true,
	templateUrl: './object-mini.html',
})
export class ObjectMiniComponent {
	readonly name = input.required<string>();
	readonly imageUrl = input<string | null>(null);
	readonly selected = input(false, { transform: booleanAttribute });
	readonly pick = output<void>();
	readonly type = input<ObjectType | null>(null);


	readonly classes = computed(() => {
		const base =
			'flex flex-col shrink-0 w-28 lg:w-36 overflow-hidden rounded-card text-left shadow-card bg-card cursor-pointer transition-shadow hover:shadow-raised';
		if (this.selected())
			return `${base} ring-2 ring-primary`
		return `${base}`;
	});

	readonly emoji = computed(() => {
		const type = this.type();
		return type ? OBJECT_TYPES_EMOJI[type] : '📦';
	});
}
