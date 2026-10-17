import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { AvatarComponent } from '../../components/avatar/avatar';
import { TagComponent } from '../../components/tag/tag';
import { ButtonDirective } from '../../components/button/button.directive';
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';
import { PostsService } from '../../services/posts.service';
import { PostEntity, PostGroupData } from '../../models/post.model';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';
import { LendingService } from '../../services/lending.service';
import { formatDateRange, formatTimeAgo } from '../../shared/date-format';

@Component({
	selector: 'app-iCanHelp',
	imports: [TitleBarComponent, AvatarComponent, TagComponent, ButtonDirective, RouterLink, ErrorBannerComponent],
	host: { class: 'flex flex-col flex-1' },
	templateUrl: './iCanHelp.html',
})
export class ICanHelp implements OnInit {
	private postsService = inject(PostsService);
	private usersService = inject(UsersService);
	private lendingService = inject(LendingService);
	private route = inject(ActivatedRoute);

	readonly postId = Number(this.route.snapshot.paramMap.get('postId'));
	readonly post = signal<PostEntity | null>(null);
	private author = signal<User | null>(null);
	private postGroups = signal<PostGroupData[]>([]);
	readonly helperCount = signal(0);
	readonly bannerErrors = signal<string[]>([]);


	readonly authorName = computed(() => this.author()?.username ?? '');

	readonly groupName = computed(() =>
		this.postGroups().map((group) => group.name).join(', ') || 'No group'
	);

	readonly title = computed(() => this.post()?.title ?? '');

	readonly objectType = computed(() => this.post()?.objectType ?? '');

	readonly description = computed(() => this.post()?.description ?? '');

	readonly timeAgo = computed(() => {
		const post = this.post();
		return (post ? formatTimeAgo(post.createdAt) : '');
	});

	readonly dateRangeLabel = computed(() => {
		const post = this.post();
		return (post ? formatDateRange(post.fromDate, post.toDate) : '');
	});

	readonly isDeleted = computed(() => this.post()?.deletedAt != null);

	readonly canOffer = computed(() => this.post()?.status === 'open');

	readonly hasChosenHelper = computed(() => this.post()?.status === 'closed' && !this.isDeleted());

	ngOnInit(): void {
		this.loadPost();
		this.loadPostGroups();
		this.loadHelperCount();
	}

	private loadPost(): void {
		this.postsService.findOne(this.postId).subscribe({
			next: (post) => {
				this.post.set(post);
				if (post.deletedAt)
					this.showError('This request was deleted');
				this.loadAuthor(post.ownerId);
			},
			error: () => this.showError('This request no longer exists'),
		});
	}

	private loadAuthor(ownerId: number): void {
		this.usersService.findOne(ownerId).subscribe({
			next: (user) => this.author.set(user),
			error: () => this.showError('Could not load who posted this request'),
		});
	}

	private loadPostGroups(): void {
		this.postsService.findGroups(this.postId).subscribe({
			next: (groups) => this.postGroups.set(groups),
			error: () => this.showError('Could not load the groups of this request'),
		});
	}

	private loadHelperCount(): void {
		this.lendingService.countForPost(this.postId).subscribe({
			next: ({ count }) => this.helperCount.set(count),
			error: () => this.showError('Could not load how many people offered to help'),
		});
	}


	// Adds a message to the banner once, even when several requests fail the same way
	private showError(message: string): void {
		this.bannerErrors.update((errors) => errors.includes(message) ? errors : [...errors, message]);
	}
}
