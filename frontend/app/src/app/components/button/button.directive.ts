import { Directive, HostBinding, Input, booleanAttribute } from '@angular/core';

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
	@Input({ transform: booleanAttribute }) block = false;

	@HostBinding('class')
	get classes(): string {
		const display = this.block ? 'flex w-full' : 'inline-flex';
		// disabled: covers the invalid-form state on submit CTAs — muted
		// surface, no pointer, and the variant's hover/active must not fire.
		const base =
			`${display} cursor-pointer items-center justify-center rounded-card font-bold transition-colors duration-150 ease-in-out`
			+ ' disabled:bg-muted disabled:text-secondary disabled:cursor-not-allowed'
			+ ' disabled:hover:bg-muted disabled:active:bg-muted';

		// Hover and active live in the variant, not the base: turning a
		// secondary button orange has to switch its text colour too.
		// active: is the touch-device feedback — hover never fires there.
		const variants: Record<ButtonVariant, string> = {
			primary: 'bg-primary text-on-primary hover:bg-alert active:bg-alert',
			secondary: 'bg-secondary text-on-secondary hover:bg-primary hover:text-on-primary active:bg-primary active:text-on-primary',
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
