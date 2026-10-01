import { Component, Input, booleanAttribute } from '@angular/core';
import { ButtonDirective, ButtonSize, ButtonVariant } from './button.directive';

/**
 * Convenience wrapper around ButtonDirective for the common case:
 * a real <button> that performs an action.
 *
 * When the click navigates, don't use this — put the directive on an
 * anchor instead: <a appButton routerLink="...">.
 */
@Component({
	selector: 'app-button',
	standalone: true,
	imports: [ButtonDirective],
	host: { '[class.block]': 'block', '[class.w-full]': 'block' },
	template: `
		<button [type]="type" appButton [variant]="variant" [size]="size" [block]="block">
			<ng-content></ng-content>
		</button>
	`,
})
export class ButtonComponent {
	@Input() variant: ButtonVariant = 'primary';
	@Input() size: ButtonSize = 'medium';
	@Input() type: 'button' | 'submit' | 'reset' = 'button';
	@Input({ transform: booleanAttribute }) block = false;
}
