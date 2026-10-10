import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { OfferCardComponent, OfferCardState } from '../../components/offer-card/offer-card';
import { TagComponent } from '../../components/tag/tag';
import { HelpRequestTag } from '../../models/help-request.model';
import { GroupsService } from '../../services/groups.service';
import { PostsService } from '../../services/posts.service';
import { PostEntity, PostGroupData } from '../../models/post.model';
import { ObjectService } from '../../services/object.service';
import { ObjectEntity } from '../../models/object.model';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';
import { LendingService } from '../../services/lending.service';
import { LendingEntity } from '../../models/lending.model';
import { Observable } from 'rxjs';
import { formatTimeAgo } from '../../shared/date-format';

@Component({
	selector: 'app-myRequest',
	standalone: true,
	imports: [Modal, OfferCardComponent, TagComponent],
	templateUrl: './myRequest.html',
})
export class MyRequest implements OnInit {
	readonly modalService = inject(ModalService);
	private groupsService = inject(GroupsService);
	private postsService = inject(PostsService);
	private lendingService = inject(LendingService);
	private usersService = inject(UsersService);
	private objectService = inject(ObjectService);


	private readonly groupsPost = signal<PostGroupData[]>([]);
	private readonly memberIdsByGroupId = signal<Map<number, number[]>>(new Map());
	readonly post = signal<PostEntity | null>(null);
	private readonly lendings = signal<LendingEntity[]>([]);
	private readonly lendersById = signal<Map<number, User>>(new Map());
	private readonly objectsById = signal<Map<number, ObjectEntity>>(new Map());
	readonly errorMessage = signal<string | null>(null);


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
		return post ? [{ label: post.objectType, icon: 'tag' }] : [];
	});


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
			error: (err) => console.error('Failed to load the request', err),
		});
	}

	private loadGroupsPost(postId: number): void {
		this.postsService.findGroups(postId).subscribe({
			next: (groups) => {
				this.groupsPost.set(groups);
				this.loadMemberIdsByGroupId(groups);
			},
			error: (err) => console.error('Failed to load the request groups', err),
		});
	}

	private loadMemberIdsByGroupId(groups: PostGroupData[]): void {
		for (const group of groups) {
			this.groupsService.findMembers(group.id).subscribe({
				next: (members) => this.memberIdsByGroupId.update((map) =>
					new Map(map).set(group.id, members.map((m) => m.userId))),
				error: (err) => console.error('Failed to load group members', err),
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
			error: (err) => console.error('Failed to load offers', err),
		});
	}

	private loadLendersById(offers: LendingEntity[]): void {
		for (const lenderId of new Set(offers.map((l) => l.lenderId))) {
			this.usersService.findOne(lenderId).subscribe({
				next: (user) => this.lendersById.update((map) => new Map(map).set(lenderId, user)),
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


	// TODO(chat): open the conversation with this offerer — the chat view
	// belongs to the chat chantier; this seam is the agreed entry point (A).
	openConversation(offerId: number): void {
		void offerId;
	}

	onAccept(lendingId: number): void {
		this.decideOffer(this.lendingService.accept(lendingId));
	}

	onDecline(lendingId: number): void {
		this.decideOffer(this.lendingService.reject(lendingId));
	}


	private decideOffer(decision: Observable<LendingEntity>): void {
		const postId = this.modalService.myRequestPostId();
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

	private sharedGroupName(lenderId: number): string {
		const group = this.groupsPost().find((g) =>
			this.memberIdsByGroupId().get(g.id)?.includes(lenderId)
		);
		return (group?.name ?? '');
	}
}
