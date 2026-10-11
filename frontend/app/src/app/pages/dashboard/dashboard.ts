import { Component, OnInit, computed, inject, signal, effect, untracked } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { RequestCard } from '../../components/request-card/request-card';
import { HelpRequest } from '../../models/help-request.model';
import { Exchange, ExchangeTone, OFFER_STATUS, TONE_ORDER, CHOSEN_STATUSES } from '../../models/exchange.model';
import { StatCardComponent } from '../../components/stat-card/stat-card';
import { ModalService } from '../../services/modal.service';
import { GroupsService } from '../../services/groups.service';
import { GroupEntity } from '../../models/group.model';
import { PostsService } from '../../services/posts.service';
import { PostEntity, PostGroupData } from '../../models/post.model';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';
import { LendingService } from '../../services/lending.service';
import { LendingEntity } from '../../models/lending.model';
import { ObjectService } from '../../services/object.service';
import { ObjectEntity } from '../../models/object.model';
import { RefreshService } from '../../services/refresh.service';
import { HeaderAppComponent } from '../../components/header-app/header-app';
import { FabActionComponent } from '../../components/fab-action/fab-action';
import { ExchangeRowComponent } from '../../components/exchange-row/exchange-row';
import { formatDateRange, formatTimeAgo } from '../../shared/date-format';

type DashboardTab = 'requests' | 'exchanges';

@Component({
	selector: 'app-dashboard',
	imports: [NgClass, RouterLink, RequestCard, StatCardComponent, HeaderAppComponent, FabActionComponent, ExchangeRowComponent],
	templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {

	private groupsService = inject(GroupsService);
	private postsService = inject(PostsService);
	private usersService = inject(UsersService);
	readonly modalService = inject(ModalService);
	private refreshService = inject(RefreshService);
	private lendingService = inject(LendingService);
	private objectService = inject(ObjectService);
	private router = inject(Router);

	readonly groups = signal<GroupEntity[]>([]);
	readonly posts = signal<PostEntity[]>([]);
	private authorsById = signal<Map<number, User>>(new Map());
	private groupsByPostId = signal<Map<number, PostGroupData[]>>(new Map());
	readonly selectedGroupId = signal<number | null>(null);
	readonly activeTab = signal<DashboardTab>('requests');
	readonly fabOpen = signal(false);
	readonly errorMessage = signal<string | null>(null);
	readonly lendings = signal<LendingEntity[]>([]);
	private objectsById = signal<Map<number, ObjectEntity>>(new Map());


	private readonly currentUserId = computed(() => this.refreshService.user()?.id ?? null)

	readonly myPosts = computed(() =>
		this.filteredPosts().filter((post) => post.ownerId === this.currentUserId())
	);

	readonly otherPosts = computed(() =>
		this.filteredPosts().filter((post) => post.ownerId !== this.currentUserId())
	);

	readonly filteredPosts = computed(() => {
		const groupId = this.selectedGroupId();
		if (groupId === null) {
			return (this.posts());
		}
		return (this.posts().filter((post) =>
			this.groupsByPostId().get(post.id)?.some((group) => group.id === groupId) ?? false));
	});

	readonly displayedRequests = computed<HelpRequest[]>(() =>
		this.otherPosts().map((post) => this.toHelpRequest(post))
	);

	readonly pendingReceivedOffers = computed(() => {
		const myPostIds = new Set(this.myPosts().map((post) => post.id));
		return (this.lendings().filter((l) =>
			l.postId !== null && myPostIds.has(l.postId) && l.status === 'pending'));
	});

	readonly myExchanges = computed<Exchange[]>(() =>
		[...this.myRequestExchanges(), ...this.myOfferExchanges()]
			.sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone])
	);

	readonly requestCount = computed(() => this.displayedRequests().length);

	readonly offerCount = computed(() => this.pendingReceivedOffers().length);


	// Reload what a modal may have changed (an accepted offer, a new request...) once it closes
	constructor() {
		effect(() => {
			if (this.modalService.activeModal() === null)
				untracked(() => {
					this.loadPosts();
					this.loadLendings();
				});
		});
	}

	ngOnInit(): void {
		this.loadGroups();
		this.loadMyObjects();
	}

	private loadGroups(): void {
		this.groupsService.findMy().subscribe({
			next: (groups) => this.groups.set(groups),
			error: (err) => {
				console.error(err);
				this.errorMessage.set('Could not load your group(s)');
			},
		});
	}

	private loadPosts(): void {
		this.postsService.findFromMyGroups().subscribe({
			next: (posts) => {
				this.posts.set(posts);
				this.loadAuthorsById(posts);
				this.loadGroupsByPostId(posts);
			},
			error: (err) => console.error('Failed to load posts', err),
		});
	}

	private loadAuthorsById(posts: PostEntity[]): void {
		const ownerIds = new Set(posts.map((post) => post.ownerId));
		for (const ownerId of ownerIds) {
			this.usersService.findOne(ownerId).subscribe({
				next: (user) => this.authorsById.update((map) => new Map(map).set(ownerId, user)),
				error: (err) => console.error('Failed to load author', err),
			});
		}
	}

	private loadGroupsByPostId(posts: PostEntity[]): void {
		for (const post of posts) {
			this.postsService.findGroups(post.id).subscribe({
				next: (groups) => this.groupsByPostId.update((map) => new Map(map).set(post.id, groups)),
				error: (err) => console.error('Failed to load post groups', err),
			});
		}
	}

	private loadLendings(): void {
		this.lendingService.listAll().subscribe({
			next: (lendings) => this.lendings.set(lendings),
			error: (err) => console.error('Failed to load lendings', err),
		});
	}

	private loadMyObjects(): void {
		this.objectService.findMy().subscribe({
			next: (objects) => this.objectsById.set(new Map(objects.map((object) => [object.id, object]))),
			error: (err) => console.error('Failed to load my objects', err),
		});
	}


	selectTab(tab: DashboardTab): void {
		this.activeTab.set(tab);
	}

	onExchangePress(exchange: Exchange): void {
		if (exchange.kind === 'request')
			this.modalService.openMyRequest(exchange.postId);
		else if (exchange.lendingId !== null)
			this.modalService.openMyOffer(exchange.lendingId);
	}

	onGroupFilterChange(event: Event): void {
		const value = (event.target as HTMLSelectElement).value;
		this.selectedGroupId.set(value === '' ? null : Number(value));
	}

	toggleFab(): void {
		this.fabOpen.update(open => !open);
	}

	closeFab(): void {
		this.fabOpen.set(false);
	}

	openAddObjectModal(): void {
		this.closeFab();
		this.modalService.openAddObject();
	}

	openAddPostModal(): void {
		this.closeFab();
		this.modalService.openAddPost();
	}

	openAddGroupModal(): void {
		this.closeFab();
		this.modalService.openAddGroup();
	}


	/** Transforme un PostEntity brut en HelpRequest utilisable par RequestCard. */
	private toHelpRequest(post: PostEntity): HelpRequest {
		const groups = this.groupsByPostId().get(post.id) ?? [];

		return {
			id: post.id,
			authorName: this.authorsById().get(post.ownerId)?.username ?? '',
			groupName: groups.map((g) => g.name).join(', ') || 'No group',
			timeAgo: formatTimeAgo(post.createdAt),
			title: post.title,
			description: post.description ?? '',
			tags: [
				{ icon: 'tag', label: post.objectType },
				{ icon: 'calendar', label: formatDateRange(post.fromDate, post.toDate) },
			],
			status: post.status === 'closed' ? 'done' : 'open',
		};
	}

	private myRequestExchanges(): Exchange[] {
		const me = this.currentUserId();

		return this.myPosts().map((post) => {
			const offers = this.lendings().filter((l) =>
				l.postId === post.id && l.borrowerId === me && (l.status === 'pending' || l.status === 'accepted')
			).length;

			let statusLabel = 'no reply';
			let tone: ExchangeTone = 'waiting';
			const chosen = this.lendings().find((l) =>
				l.postId === post.id && l.borrowerId === me && CHOSEN_STATUSES.includes(l.status));

			if (chosen) {
				statusLabel = chosen.status === 'accepted' ? 'helper chosen' : OFFER_STATUS[chosen.status].label;
				tone = OFFER_STATUS[chosen.status].tone;
			}
			else if (post.status === 'closed') {
				statusLabel = 'closed';
				tone = 'done';
			}
			else if (offers > 0) {
				statusLabel = `${offers} offer${offers > 1 ? 's' : ''}`;
				tone = 'attention';
			}

			return {
				id: `post-${post.id}`,
				kind: 'request',
				postId: post.id,
				title: post.title,
				subtitle: `my request · ${formatTimeAgo(post.createdAt)}`,
				statusLabel,
				tone,
				lendingId: null
			};
		});
	}

	private myOfferExchanges(): Exchange[] {
		const me = this.currentUserId();

		return this.lendings()
			.filter((l) => l.lenderId === me && l.postId !== null)
			.map((l) => ({
				id: `lending-${l.id}`,
				kind: 'offer',
				postId: l.postId!,
				title: `${this.objectsById().get(l.objectId)?.name ?? '…'} → ${this.authorsById().get(l.borrowerId)?.username ?? '…'}`,
				subtitle: `my offer · ${formatTimeAgo(l.createdAt)}`,
				statusLabel: OFFER_STATUS[l.status].label,
				tone: OFFER_STATUS[l.status].tone,
				lendingId: l.id
			}));
	}

}


