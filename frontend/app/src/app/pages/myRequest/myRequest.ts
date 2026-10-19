import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { GroupsService } from '../../services/groups.service';
import { PostsService } from '../../services/posts.service';
import { PostEntity, PostGroupData } from '../../models/post.model';
import { ObjectService } from '../../services/object.service';
import { ObjectEntity } from '../../models/object.model';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';
import { LendingService } from '../../services/lending.service';
import { LendingEntity } from '../../models/lending.model';
import { Observable, finalize } from 'rxjs';
import { HelpRequestTag } from '../../models/help-request.model';
import { OfferCardComponent, OfferCardState } from '../../components/offer-card/offer-card';
import { ButtonDirective } from '../../components/button/button.directive';
import { TagComponent } from '../../components/tag/tag';
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';
import { formatTimeAgo } from '../../shared/date-format';

@Component({
	selector: 'app-myRequest',
	imports: [Modal, OfferCardComponent, ButtonDirective, TagComponent, ErrorBannerComponent],
	templateUrl: './myRequest.html',
})
export class MyRequest implements OnInit {
	readonly modalService = inject(ModalService);
	private groupsService = inject(GroupsService);
	private postsService = inject(PostsService);
	private objectService = inject(ObjectService);
	private usersService = inject(UsersService);
	private lendingService = inject(LendingService);
	private router = inject(Router);

	private groupsPost = signal<PostGroupData[]>([]);
	private memberIdsByGroupId = signal<Map<number, number[]>>(new Map());
	readonly post = signal<PostEntity | null>(null);
	private objectsById = signal<Map<number, ObjectEntity>>(new Map());
	private lendings = signal<LendingEntity[]>([]);
	private lendersById = signal<Map<number, User>>(new Map());
	readonly cancelling = signal(false);
	readonly bannerErrors = signal<string[]>([]);


	readonly offers = computed(() =>
		this.lendings().map((l) => ({
			id: l.id,
			name: this.lendersById().get(l.lenderId)?.username ?? '…',
			group: this.sharedGroupName(l.lenderId),
			time: formatTimeAgo(l.createdAt),
			objectName: this.objectsById().get(l.objectId)?.name ?? '…',
			message: l.message,
			state: (l.status === 'accepted' ? 'accepted' : 'pending') as OfferCardState,
		}))
	);

	readonly requestTags = computed<HelpRequestTag[]>(() => {
		const post = this.post();
		return (post ? [{ label: post.objectType, icon: 'tag' }] : []);
	});

	readonly canCancel = computed(() => this.post()?.status === 'open');


	ngOnInit(): void {
		const postId = this.modalService.myRequestPostId();
		if (postId === null)
			return;

		this.loadPost(postId);
		this.loadGroupsPost(postId);
		this.loadReceivedOffers(postId);
	}

	private loadPost(postId: number): void {
		this.postsService.findOne(postId).subscribe({
			next: (post) => this.post.set(post),
			error: () => this.showError('Could not load this request'),
		});
	}

	private loadGroupsPost(postId: number): void {
		this.postsService.findGroups(postId).subscribe({
			next: (groups) => {
				this.groupsPost.set(groups);
				this.loadMemberIdsByGroupId(groups);
			},
			error: () => this.showError('Could not load the groups of this request'),
		});
	}

	private loadMemberIdsByGroupId(groups: PostGroupData[]): void {
		for (const group of groups) {
			this.groupsService.findMembers(group.id).subscribe({
				next: (members) => this.memberIdsByGroupId.update((map) =>
					new Map(map).set(group.id, members.map((m) => m.userId))),
				error: () => { },
			});
		}
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
			error: () => this.showError('Could not load the offers'),
		});
	}

	private loadLendersById(offers: LendingEntity[]): void {
		for (const lenderId of new Set(offers.map((l) => l.lenderId))) {
			this.usersService.findOne(lenderId).subscribe({
				next: (user) => this.lendersById.update((map) => new Map(map).set(lenderId, user)),
				error: () => this.showError('Could not load who made some offers'),
			});
		}
	}

	private loadObjectsById(offers: LendingEntity[]): void {
		for (const objectId of new Set(offers.map((l) => l.objectId))) {
			this.objectService.findOne(objectId).subscribe({
				next: (object) => this.objectsById.update((map) => new Map(map).set(objectId, object)),
				error: () => this.showError('Could not load some offered items'),
			});
		}
	}


	// The chat of an offer is the one about this post with its offerer
	openConversation(offerId: number): void {
		const offer = this.lendings().find((l) => l.id === offerId);
		if (!offer)
			return;

		this.modalService.close();
		this.router.navigate(['/app/chats'], { queryParams: { post: offer.postId, with: offer.lenderId } });
	}

	onAccept(lendingId: number): void {
		this.decideOffer(this.lendingService.accept(lendingId));
	}

	onDecline(lendingId: number): void {
		this.decideOffer(this.lendingService.reject(lendingId));
	}

	onCancelRequest(): void {
		const postId = this.modalService.myRequestPostId();
		if (postId === null || this.cancelling())
			return;

		this.bannerErrors.set([]);
		this.cancelling.set(true);
		this.postsService.remove(postId)
			.pipe(finalize(() => this.cancelling.set(false)))
			.subscribe({
				next: () => this.modalService.close(),
				error: () => this.showError('Could not cancel this request, please try again'),
			});
	}

	// Sends an accept or a decline, then reloads the offers to show their new state
	private decideOffer(decision: Observable<LendingEntity>): void {
		const postId = this.modalService.myRequestPostId();
		if (postId === null)
			return;

		this.bannerErrors.set([]);
		decision.subscribe({
			next: () => this.loadReceivedOffers(postId),
			error: () => this.showError('Could not update this offer, please try again'),
		});
	}

	// The first group of this request the offerer is in, shown on their card
	private sharedGroupName(lenderId: number): string {
		const group = this.groupsPost().find((g) =>
			this.memberIdsByGroupId().get(g.id)?.includes(lenderId)
		);
		return (group?.name ?? '');
	}

	// Adds a message to the banner once, even when several requests fail the same way
	private showError(message: string): void {
		this.bannerErrors.update((errors) => errors.includes(message) ? errors : [...errors, message]);
	}
}
