import { Component, input, output } from '@angular/core';
import { ButtonDirective } from '../button/button.directive';
import { StatusBadgeComponent } from '../status-badge/status-badge';
import { AvatarComponent } from '../avatar/avatar';

export type OfferCardState = 'pending' | 'accepted' | 'borrowed' | 'overdue' | 'returning' | 'returned';

/**
 * One offer received on your request.
 *
 * Accept is primary, decline is present on purpose — refusing politely is
 * part of the flow, hiding it would only produce ghosting.
 *
 * The card BODY (who + object zones) opens the conversation with the
 * offerer — the chat bubble beside the time is the affordance; the
 * buttons only decide.
 */
@Component({
	selector: 'app-offer-card',
	standalone: true,
	imports: [ButtonDirective, StatusBadgeComponent, AvatarComponent],
	templateUrl: './offer-card.html',
})
export class OfferCardComponent {
	readonly name = input.required<string>();
	readonly group = input.required<string>();
	readonly time = input.required<string>();
	readonly objectName = input.required<string>();
	readonly message = input<string | null>(null);
	readonly state = input<OfferCardState>('pending');

	readonly accept = output<void>();
	readonly decline = output<void>();
	readonly pickUp = output<void>();
	readonly giveBack = output<void>();
	/** Body pressed — open the conversation with the offerer. */
	readonly press = output<void>();
}
