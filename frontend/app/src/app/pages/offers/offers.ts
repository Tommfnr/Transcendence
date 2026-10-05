import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { OfferCardComponent } from '../../components/offer-card/offer-card';
import { TagComponent } from '../../components/tag/tag';
import { PostsService } from '../../services/posts.service';
import { PostEntity } from '../../models/post.model';
import { HelpRequestTag } from '../../models/help-request.model';


@Component({
	selector: 'app-offers',
	standalone: true,
	imports: [Modal, OfferCardComponent, TagComponent],
	templateUrl: './offers.html',
})
export class Offers implements OnInit {
	readonly modalService = inject(ModalService);
	private postsService = inject(PostsService);

	readonly post = signal<PostEntity | null>(null);

	readonly requestTags = computed<HelpRequestTag[]>(() => {
		const post = this.post();
		return post ? [{ label: post.objectType, icon: 'tag' }] : [];
	});


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

	ngOnInit(): void {
		const postId = this.modalService.offersPostId();
		if (postId === null)
			return;

		this.postsService.findOne(postId).subscribe({
			next: (post) => this.post.set(post),
			error: (err) => console.error('Failed to load the request', err),
		});
	}
}
