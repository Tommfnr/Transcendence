import { Component } from '@angular/core';
import { Input, Output, EventEmitter, booleanAttribute } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';


export type ListRowTrailing = 'pen' | 'arrow';

@Component({
	selector: 'app-list-row',
	imports: [RouterLink, NgTemplateOutlet],
	templateUrl: './list-row.html',
})

export class ListRowComponent {
	@Input({ required: true }) label!: string;
	@Input() value: string | null = null;
	@Input() link: string | unknown[] | null = null;
	@Input({ transform: booleanAttribute }) editable = false;
	@Output() edit = new EventEmitter<void>();

	get trailing(): 'arrow' | 'pen' | null {
		return this.link ? 'arrow' : this.editable ? 'pen' : null;
	}

	private static readonly ICONS: Record<ListRowTrailing, string> = {
		pen: '/icons/pen.svg',
		arrow: '/icons/chevron-down.svg',
	};

	get icon(): string {
		return ListRowComponent.ICONS[this.trailing!];
	}

	get iconClasses(): string {
		const sizes: Record<ListRowTrailing, string> = {
			pen: 'size-4 shrink-0',
			arrow: 'size-4 shrink-0 -rotate-90',
		};
		return `${sizes[this.trailing!]}`;
	}

	get rowClasses(): string {
		const base =
			'flex h-12 w-full items-center justify-between rounded-card bg-card py-3 pr-3 pl-4';

		if (this.link || this.editable) {
			return `${base} cursor-pointer text-left shadow-card transition-shadow hover:shadow-raised active:bg-background`;
		}
		return base;
	}

}
