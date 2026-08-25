import { Component, Input } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'small' | 'medium' | 'large';

@Component({
	selector: 'app-button',
	standalone: true,
	template: `
		<button [class]="classes">
			<ng-content></ng-content>
		</button>
	`,
})

export class ButtonComponent {
	@Input() variant: 'primary' | 'secondary' = 'primary';
	@Input() size: 'small' | 'medium' | 'large' = 'medium';

	get classes():string {
		const base = 'cursor-pointer rounded-card hover:bg-alert transition-colors duration-300 ease-in-out font-bold';
		const variants: Record<ButtonVariant, string> = {
			'primary': 'bg-primary text-white',
			'secondary': 'bg-secondary text-white'
		};
		const sizes: Record<ButtonSize, string> = {
			'small': 'text-sm px-3 py-1.5',
			'medium': 'text-base px-4 py-2',
			'large': 'text-lg px-6 py-3'
		};

		return `${base} ${variants[this.variant]} ${sizes[this.size]}`;
	}
}
