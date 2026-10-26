import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { GroupsService } from '../../services/groups.service';
import { PostsService } from '../../services/posts.service';
import { PostEntity, PostGroupData } from '../../models/post.model';
import { UsersService } from '../../services/users.service';
import { ObjectService } from '../../services/object.service';
import { ObjectEntity } from '../../models/object.model';
import { User } from '../../models/user.model';
import { LendingService } from '../../services/lending.service';
import { LendingEntity, LendingStatus, CHOSEN_STATUSES } from '../../models/lending.model';
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
	private usersService = inject(UsersService);
	private objectService = inject(ObjectService);
	private lendingService = inject(LendingService);
	private router = inject(Router);

	private groupsPost = signal<PostGroupData[]>([]);
	private memberIdsByGroupId = signal<Map<number, number[]>>(new Map());
	readonly post = signal<PostEntity | null>(null);
	private lendings = signal<LendingEntity[]>([]);
	private lendersById = signal<Map<number, User>>(new Map());
	private objectsById = signal<Map<number, ObjectEntity>>(new Map());
	readonly cancelling = signal(false);
	readonly bannerErrors = signal<string[]>([]);

	private postId = this.modalService.myRequestPostId();

	readonly offers = computed(() =>
		this.lendings().map((l) => ({
			id: l.id,
			name: this.lendersById().get(l.lenderId)?.username ?? '',
			group: this.sharedGroupName(l.lenderId),
			time: formatTimeAgo(l.createdAt),
			objectName: l.objectName,
			objectType: this.objectsById().get(l.objectId)?.type ?? null,
			message: l.message,
			state: this.cardStateOf(l.status),
		}))
	);

	readonly requestTags = computed<HelpRequestTag[]>(() => {
		const post = this.post();
		return (post ? [{ label: post.objectType, icon: 'tag' }] : []);
	});

	readonly canCancel = computed(() => this.post()?.status === 'open');


	ngOnInit(): void {
		if (this.postId === null)
			return;

		this.loadPost(this.postId);
		this.loadGroupsPost(this.postId);
		this.loadReceivedOffers(this.postId);
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
					l.postId === postId && (l.status === 'pending' || CHOSEN_STATUSES.includes(l.status))
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
		this.applyAction(this.lendingService.accept(lendingId));
	}

	onDecline(lendingId: number): void {
		this.applyAction(this.lendingService.reject(lendingId));
	}

	onCancelRequest(): void {
		if (this.postId === null || this.cancelling())
			return;

		this.bannerErrors.set([]);
		this.cancelling.set(true);
		this.postsService.remove(this.postId)
			.pipe(finalize(() => this.cancelling.set(false)))
			.subscribe({
				next: () => this.modalService.close(),
				error: () => this.showError('Could not cancel this request, please try again'),
			});
	}

	onPickUp(lendingId: number): void {
		this.applyAction(this.lendingService.pickUp(lendingId));
	}

	onGiveBack(lendingId: number): void {
		this.applyAction(this.lendingService.giveBack(lendingId));
	}

	// Sends an action on an offer or on the chosen loan
	private applyAction(action: Observable<LendingEntity>): void {
		this.bannerErrors.set([]);
		
		action.subscribe({
			next: () => this.modalService.close(),
			error: (err) => this.showError(this.errorMessageOf(err)),
		});
	}

	// The card mode for each step of the loan
	private cardStateOf(status: LendingStatus): OfferCardState {
		if (status === 'pending')
			return ('pending');
		if (status === 'active')
			return ('borrowed');
		if (status === 'overdue')
			return ('overdue');
		if (status === 'awaiting_confirmation')
			return ('returning');
		if (status === 'returned')
			return ('returned');
		return ('accepted');
	}


	// The first group of this request the offerer is in, shown on their card
	private sharedGroupName(lenderId: number): string {
		const group = this.groupsPost().find((g) =>
			this.memberIdsByGroupId().get(g.id)?.includes(lenderId)
		);
		return (group?.name ?? '');
	}

	// The backend message when there is one, a generic one otherwise
	private errorMessageOf(err: unknown): string {
		if (err instanceof HttpErrorResponse && typeof err.error?.message === 'string')
			return (err.error.message);
		return ('Something went wrong, please try again');
	}

	// Adds a message to the banner once, even when several requests fail the same way
	private showError(message: string): void {
		this.bannerErrors.update((errors) => errors.includes(message) ? errors : [...errors, message]);
	}
}
