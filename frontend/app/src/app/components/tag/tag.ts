import { Component, Input } from '@angular/core';
import { HelpRequestTagIcon } from '../../models/help-request.model';

/**
 * Category or date chip on a request card.
 *
 * Read-only: a tag is a label, never a control. If it needs to be clickable,
 * it is a filter, and that is a different component.
 */
@Component({
	selector: 'app-tag',
	standalone: true,
	template: `
		<span
			class="flex items-center gap-1 rounded-sm bg-complementary-surface px-2 py-1"
		>
			@if (icon) {
				<img [src]="'/icons/' + icon + '.svg'" alt="" class="size-3" />
			}
			<span class="whitespace-nowrap text-2xs tracking-tight text-strong">
				{{ label }}
			</span>
		</span>
	`,
})
export class TagComponent {
	@Input({ required: true }) label!: string;
	@Input() icon?: HelpRequestTagIcon;
}
