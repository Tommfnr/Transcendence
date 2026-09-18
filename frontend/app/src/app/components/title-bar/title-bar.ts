import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
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
	private router = inject(Router);
	private location = inject(Location);


	get classes(): string {
		const base = 'fixed top-0 inset-x-0 z-10 bg-background mx-auto max-w-app pt-2';
		return `${base}`;
	}

	get headingClasses(): string {
		const base = 'flex items-center min-w-0';
		return `${base} ${this.leading === 'avatar' ? 'gap-3' : 'gap-2'}`;
	}

	goBack(): void {
		if (window.history.length > 1) {
			this.location.back();
		} else {
			this.router.navigate(['/app/dashboard']);
		}
	}
}
