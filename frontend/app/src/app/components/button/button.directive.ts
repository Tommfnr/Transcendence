import { Directive, HostBinding, Input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'xsmall' | 'small' | 'medium' | 'large';

/**
 * Shared button appearance, applicable to either element.
 *
 * Use <button appButton> when the click performs an action, and
 * <a appButton routerLink="..."> when it navigates — the styling is the
 * same, the semantics are not. A link keeps its URL, its history entry,
 * ctrl+click, and is announced as a link by screen readers.
 */
@Directive({
	selector: '[appButton]',
	standalone: true,
})
export class ButtonDirective {
	@Input() variant: ButtonVariant = 'primary';
	@Input() size: ButtonSize = 'medium';

	@HostBinding('class')
	get classes(): string {
		const base =
			'inline-flex cursor-pointer items-center justify-center rounded-card font-bold transition-colors duration-300 ease-in-out';

		// Hover lives in the variant, not the base: turning a secondary button
		// orange has to switch its text colour too, or white lands on #FF7700
		// at 2.7:1.
		const variants: Record<ButtonVariant, string> = {
			primary: 'bg-primary text-on-primary hover:bg-alert',
			secondary: 'bg-secondary text-on-secondary hover:bg-alert hover:text-on-primary',
		};

		const sizes: Record<ButtonSize, string> = {
			xsmall: 'text-xs px-2 py-1',
			small: 'text-sm px-3 py-2',
			medium: 'text-base px-4 py-2',
			large: 'text-lg px-6 py-3',
		};

		return `${base} ${variants[this.variant]} ${sizes[this.size]}`;
	}
}
