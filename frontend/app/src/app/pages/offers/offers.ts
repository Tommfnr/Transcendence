import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { OfferCardComponent } from '../../components/offer-card/offer-card';
import { TagComponent } from '../../components/tag/tag';
import { PostsService } from '../../services/posts.service';
import { PostEntity } from '../../models/post.model';
import { HelpRequestTag } from '../../models/help-request.model';
import { LendingService } from '../../services/lending.service';
import { UsersService } from '../../services/users.service';
import { ObjectService } from '../../services/object.service';
import { LendingEntity } from '../../models/lending.model';
import { User } from '../../models/user.model';
import { ObjectEntity } from '../../models/object.model';
import { OfferCardState } from '../../components/offer-card/offer-card';
import { Observable } from 'rxjs';
import { formatTimeAgo } from '../../shared/date-format';

@Component({
	selector: 'app-offers',
	standalone: true,
	imports: [Modal, OfferCardComponent, TagComponent],
	templateUrl: './offers.html',
})
export class Offers implements OnInit {
	readonly modalService = inject(ModalService);
	private postsService = inject(PostsService);
	private lendingService = inject(LendingService);
	private usersService = inject(UsersService);
	private objectService = inject(ObjectService);

	readonly post = signal<PostEntity | null>(null);
	private readonly lendings = signal<LendingEntity[]>([]);
	private readonly usersById = signal<Map<number, User>>(new Map());
	private readonly objectsById = signal<Map<number, ObjectEntity>>(new Map());
	private readonly groupNames = signal('');
	readonly errorMessage = signal<string | null>(null);

	readonly offers = computed(() =>
		this.lendings().map((l) => ({
			id: l.id,
			name: this.usersById().get(l.lenderId)?.username ?? '…',
			group: this.groupNames(),
			time: formatTimeAgo(l.createdAt),
			objectName: this.objectsById().get(l.objectId)?.name ?? '…',
			message: l.message,
			state: (l.status === 'accepted' ? 'accepted' : 'pending') as OfferCardState,
		}))
	);


	readonly requestTags = computed<HelpRequestTag[]>(() => {
		const post = this.post();
		return post ? [{ label: post.objectType, icon: 'tag' }] : [];
	});


	// TODO(chat): open the conversation with this offerer — the chat view
	// belongs to the chat chantier; this seam is the agreed entry point (A).
	openConversation(offerId: number): void {
		void offerId;
	}

	ngOnInit(): void {
		const postId = this.modalService.offersPostId();
		if (postId === null)
			return;

		this.loadPost(postId);
		this.loadGroupsPost(postId);
		this.loadReceivedOffers(postId);
	}

	private loadPost(postId: number): void {
		this.postsService.findOne(postId).subscribe({
			next: (post) => this.post.set(post),
			error: (err) => console.error('Failed to load the request', err),
		});
	}

	private loadGroupsPost(postId: number): void {
		this.postsService.findGroups(postId).subscribe({
			next: (groups) => this.groupNames.set(groups.map((g) => g.name).join(', ')),
			error: (err) => console.error('Failed to load the request groups', err),
		});
	}

	private loadReceivedOffers(postId: number): void {
		this.lendingService.listAll().subscribe({
			next: (lendings) => {
				const offers = lendings.filter((l) =>
					l.postId === postId && (l.status === 'pending' || l.status === 'accepted')
				);
				this.lendings.set(offers);
				this.loadLendersById(offers);
				this.loadObjectsById(offers);
			},
			error: (err) => console.error('Failed to load offers', err),
		});
	}

	private loadLendersById(offers: LendingEntity[]): void {
		for (const lenderId of new Set(offers.map((l) => l.lenderId))) {
			this.usersService.findOne(lenderId).subscribe({
				next: (user) => this.usersById.update((map) => new Map(map).set(lenderId, user)),
				error: (err) => console.error('Failed to load offerer', err),
			});
		}
	}

	private loadObjectsById(offers: LendingEntity[]): void {
		for (const objectId of new Set(offers.map((l) => l.objectId))) {
			this.objectService.findOne(objectId).subscribe({
				next: (object) => this.objectsById.update((map) => new Map(map).set(objectId, object)),
				error: (err) => console.error('Failed to load offered object', err),
			});
		}
	}


	onAccept(lendingId: number): void {
		this.decideOffer(this.lendingService.accept(lendingId));
	}

	onDecline(lendingId: number): void {
		this.decideOffer(this.lendingService.reject(lendingId));
	}


	private decideOffer(decision: Observable<LendingEntity>): void {
		const postId = this.modalService.offersPostId();
		if (postId === null)
			return;

		this.errorMessage.set(null);
		decision.subscribe({
			next: () => this.loadReceivedOffers(postId),
			error: (err) => {
				console.error('Failed to update the offer', err);
				this.errorMessage.set('Could not update this offer, please try again');
			},
		});
	}

}
