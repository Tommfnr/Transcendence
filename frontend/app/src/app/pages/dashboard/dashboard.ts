import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { RequestCard } from '../../components/request-card/request-card';
import { HelpRequest } from '../../models/help-request.model';
import { StatCardComponent } from '../../components/stat-card/stat-card';
import { GroupsService } from '../../services/groups.service';
import { GroupEntity } from '../../models/group.model';
import { PostsService } from '../../services/posts.service';
import { HeaderAppComponent } from '../../components/header-app/header-app';
import { FabActionComponent } from '../../components/fab-action/fab-action';
import { PostEntity, PostGroupData } from '../../models/post.model';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';
import { formatDateRange, formatTimeAgo } from '../../shared/date-format';

type DashboardTab = 'requests' | 'exchanges';

@Component({
	selector: 'app-dashboard',
	imports: [NgClass, RouterLink, RequestCard, StatCardComponent, HeaderAppComponent, FabActionComponent],
	templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {

	private usersService = inject(UsersService);
	private postsService = inject(PostsService);
	private groupsService = inject(GroupsService);
	readonly modalService = inject(ModalService);

	private authorsById = signal<Map<number, User>>(new Map());
	readonly posts = signal<PostEntity[]>([]);
	readonly groups = signal<GroupEntity[]>([]);
	private groupsByPostId = signal<Map<number, PostGroupData[]>>(new Map());
	readonly selectedGroupId = signal<number | null>(null);
	readonly activeTab = signal<DashboardTab>('requests');
	readonly fabOpen = signal(false);
	readonly errorMessage = signal<string | null>(null);

	readonly filteredPosts = computed(() => {
		const groupId = this.selectedGroupId();
		if (groupId === null) {
			return (this.posts());
		}
		return (this.posts()).filter((post) =>
			this.groupsByPostId().get(post.id)?.some((group) => group.id === groupId) ?? false);
	});

	readonly displayedRequests = computed<HelpRequest[]>(() =>
		this.filteredPosts().map((post) => this.toHelpRequest(post))
	);

	readonly requestCount = computed(() => this.displayedRequests().length);
	// TODO: count from my exchanges
	readonly offerCount = 2;

	ngOnInit(): void {
		this.loadGroups();

		this.postsService.findFromMyGroups().subscribe((data) => {
			this.posts.set(data);

			const ownerIds = new Set(data.map((post) => post.ownerId));
			for (const ownerId of ownerIds) {
				this.usersService.findOne(ownerId).subscribe({
					next: (user) => this.authorsById.update((map) => new Map(map).set(ownerId, user)),
					error: (err) => console.error('Failed to load author', err),
				});
			}

			for (const post of data) {
				this.postsService.findGroups(post.id).subscribe((groups) => {
					this.groupsByPostId.update((map) => new Map(map).set(post.id, groups));
				});
			}
		});
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

	selectTab(tab: DashboardTab): void {
		this.activeTab.set(tab);
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

	
}
