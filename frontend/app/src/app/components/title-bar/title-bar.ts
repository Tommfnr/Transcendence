import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../avatar/avatar';

export type TitleBarLeading = 'avatar' | 'back' | 'none';

@Component({
	selector: 'app-title-bar',
	imports: [RouterLink, AvatarComponent],
	templateUrl: './title-bar.html',
})



export class TitleBarComponent {
	@Input({ required: true }) title!: string;
	@Input() meta: string | null = null;
	@Input({ required: true }) leading!: TitleBarLeading;
	@Output() backClick = new EventEmitter<void>();

	get classes(): string {
		const base = 'fixed top-0 inset-x-0 z-10 bg-background';
		return `${base}`;
	}

	get headingClasses(): string {
		const base = 'flex items-center min-w-0';
		return `${base} ${this.leading === 'avatar' ? 'gap-3' : 'gap-2'}`;
	}
}
