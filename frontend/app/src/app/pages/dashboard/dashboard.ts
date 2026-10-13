import { Component, computed, inject, signal, effect, untracked } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RequestCard } from '../../components/request-card/request-card';
import { HelpRequest } from '../../models/help-request.model';
import { Exchange, ExchangeTone, TONE_ORDER, LENDING_STATUS_DISPLAY, CHOSEN_STATUSES } from '../../models/exchange.model';
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
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';
import { formatDateRange, formatTimeAgo } from '../../shared/date-format';

type DashboardTab = 'requests' | 'exchanges';

@Component({
	selector: 'app-dashboard',
	imports: [NgClass, RouterLink, RequestCard, StatCardComponent, HeaderAppComponent, FabActionComponent, ExchangeRowComponent, ErrorBannerComponent],
	templateUrl: './dashboard.html',
})
export class Dashboard {
	readonly modalService = inject(ModalService);
	private refreshService = inject(RefreshService);
	private groupsService = inject(GroupsService);
	private postsService = inject(PostsService);
	private usersService = inject(UsersService);
	private objectService = inject(ObjectService);
	private lendingService = inject(LendingService);

	readonly groups = signal<GroupEntity[]>([]);
	private posts = signal<PostEntity[]>([]);
	private authorsById = signal<Map<number, User>>(new Map());
	private groupsByPostId = signal<Map<number, PostGroupData[]>>(new Map());
	private objectsById = signal<Map<number, ObjectEntity>>(new Map());
	private lendings = signal<LendingEntity[]>([]);
	private selectedGroupId = signal<number | null>(null);
	readonly activeTab = signal<DashboardTab>('requests');
	readonly fabOpen = signal(false);
	readonly bannerErrors = signal<string[]>([]);


	private currentUserId = computed(() => this.refreshService.user()?.id ?? null);

	private myPosts = computed(() =>
		this.filteredPosts().filter((post) => post.ownerId === this.currentUserId())
	);

	private otherPosts = computed(() =>
		this.filteredPosts().filter((post) => post.ownerId !== this.currentUserId())
	);

	private filteredPosts = computed(() => {
		const groupId = this.selectedGroupId();
		if (groupId === null)
			return (this.posts());
		return (this.posts().filter((post) =>
			this.groupsByPostId().get(post.id)?.some((group) => group.id === groupId) ?? false));
	});

	readonly displayedRequests = computed<HelpRequest[]>(() =>
		this.otherPosts().map((post) => this.toHelpRequest(post))
	);

	private pendingReceivedOffers = computed(() => {
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


	// Reload everything a modal may have changed (a new group, item, request, an accepted offer...) once it closes
	constructor() {
		effect(() => {
			if (this.modalService.activeModal() === null)
				untracked(() => {
					this.bannerErrors.set([]);
					this.loadGroups();
					this.loadPosts();
					this.loadMyObjects();
					this.loadLendings();
				});
		});
	}

	private loadGroups(): void {
		this.groupsService.findMy().subscribe({
			next: (groups) => this.groups.set(groups),
			error: () => this.showError('Could not load your group(s)'),
		});
	}

	private loadPosts(): void {
		this.postsService.findFromMyGroups().subscribe({
			next: (posts) => {
				this.posts.set(posts);
				this.loadAuthorsById(posts);
				this.loadGroupsByPostId(posts);
			},
			error: () => this.showError('Could not load the requests'),
		});
	}

	private loadAuthorsById(posts: PostEntity[]): void {
		const ownerIds = new Set(posts.map((post) => post.ownerId));
		for (const ownerId of ownerIds) {
			this.usersService.findOne(ownerId).subscribe({
				next: (user) => this.authorsById.update((map) => new Map(map).set(ownerId, user)),
				error: () => this.showError('Could not load who posted some requests'),
			});
		}
	}

	private loadGroupsByPostId(posts: PostEntity[]): void {
		for (const post of posts) {
			this.postsService.findGroups(post.id).subscribe({
				next: (groups) => this.groupsByPostId.update((map) => new Map(map).set(post.id, groups)),
				error: () => this.showError('Could not load the groups of some requests'),
			});
		}
	}

	private loadMyObjects(): void {
		this.objectService.findMy().subscribe({
			next: (objects) => this.objectsById.set(new Map(objects.map((object) => [object.id, object]))),
			error: () => this.showError('Could not load your items'),
		});
	}

	private loadLendings(): void {
		this.lendingService.listAll().subscribe({
			next: (lendings) => this.lendings.set(lendings),
			error: () => this.showError('Could not load your exchanges'),
		});
	}


	onGroupFilterChange(event: Event): void {
		const value = (event.target as HTMLSelectElement).value;
		this.selectedGroupId.set(value === '' ? null : Number(value));
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


	// Turns a raw PostEntity into the HelpRequest shape RequestCard expects
	private toHelpRequest(post: PostEntity): HelpRequest {
		const groups = this.groupsByPostId().get(post.id) ?? [];

		return ({
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
		});
	}

	// One row per request I posted, labelled with where it stands: no reply, N offers, helper chosen, completed...
	private myRequestExchanges(): Exchange[] {
		const me = this.currentUserId();

		return (this.myPosts().map((post) => {
			const offers = this.lendings().filter((l) =>
				l.postId === post.id && l.borrowerId === me && l.status === 'pending'
			).length;

			let statusLabel = 'no reply';
			let tone: ExchangeTone = 'waiting';
			const chosen = this.lendings().find((l) =>
				l.postId === post.id && l.borrowerId === me && CHOSEN_STATUSES.includes(l.status));

			if (chosen) {
				statusLabel = chosen.status === 'accepted' ? 'helper chosen' : LENDING_STATUS_DISPLAY[chosen.status].label;
				tone = LENDING_STATUS_DISPLAY[chosen.status].tone;
			}
			else if (post.status === 'closed') {
				statusLabel = 'closed';
				tone = 'done';
			}
			else if (offers > 0) {
				statusLabel = `${offers} offer${offers > 1 ? 's' : ''}`;
				tone = 'attention';
			}

			return ({
				id: `post-${post.id}`,
				kind: 'request',
				postId: post.id,
				title: post.title,
				subtitle: `my request · ${formatTimeAgo(post.createdAt)}`,
				statusLabel,
				tone,
				lendingId: null,
			});
		}));
	}

	// One row per offer I made on someone else's request, labelled with the status of that loan
	private myOfferExchanges(): Exchange[] {
		const me = this.currentUserId();

		return (this.lendings()
			.filter((l) => l.lenderId === me && l.postId !== null)
			.map((l) => ({
				id: `lending-${l.id}`,
				kind: 'offer',
				postId: l.postId!,
				title: `${this.objectsById().get(l.objectId)?.name ?? '…'} → ${this.authorsById().get(l.borrowerId)?.username ?? '…'}`,
				subtitle: `my offer · ${formatTimeAgo(l.createdAt)}`,
				statusLabel: LENDING_STATUS_DISPLAY[l.status].label,
				tone: LENDING_STATUS_DISPLAY[l.status].tone,
				lendingId: l.id,
			})));
	}

	// Adds a message to the banner once, even when several requests fail the same way
	private showError(message: string): void {
		this.bannerErrors.update((errors) => errors.includes(message) ? errors : [...errors, message]);
	}
}


