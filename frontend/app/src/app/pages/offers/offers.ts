import { Component, inject } from '@angular/core';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { OfferCardComponent } from '../../components/offer-card/offer-card';
import { TagComponent } from '../../components/tag/tag';

@Component({
	selector: 'app-offers',
	standalone: true,
	imports: [Modal, OfferCardComponent, TagComponent],
	templateUrl: './offers.html',
})
export class Offers {
	readonly modalService = inject(ModalService);

	// TODO(wiring): load the real request (modalService.offersPostId()) and its
	// offers from the backend. Shapes mirror the Dashboard-myExchanges-Overlay mock.
	readonly demoRequest = {
		title: 'Looking for a drill',
		tags: [
			{ label: 'DIY', icon: 'tag' },
			{ label: 'No preference', icon: 'tag' },
		],
	} as const;

	// TODO(chat): open the conversation with this offerer — the chat view
	// belongs to the chat chantier; this seam is the agreed entry point (A).
	openConversation(offerId: number): void {
		void offerId;
	}

	readonly demoOffers = [
		{
			id: 1,
			name: 'Julien',
			group: 'Best Mates',
			time: '1h ago',
			objectName: 'Bosch drill',
			message: "I can lend it to you this weekend, it's charged.",
			state: 'pending',
		},
		{
			id: 2,
			name: 'Sarah',
			group: 'Bellevue Neighbours',
			time: '3h ago',
			objectName: 'Makita drill',
			message: 'Available from Saturday morning, come by when…',
			state: 'pending',
		},
	] as const;
}
