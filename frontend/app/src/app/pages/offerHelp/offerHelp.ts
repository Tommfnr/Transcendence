import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { AvatarComponent } from '../../components/avatar/avatar';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { ObjectMiniComponent } from '../../components/object-mini/object-mini';
import { ChipComponent } from '../../components/chip/chip';
import { ButtonDirective } from '../../components/button/button.directive';
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';
import { ModalService } from '../../services/modal.service';
import { PostsService } from '../../services/posts.service';
import { PostEntity } from '../../models/post.model';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';
import { LendingService } from '../../services/lending.service';
import { ChatsService } from '../../services/chats.service';
import { ObjectService } from '../../services/object.service';
import { ObjectEntity } from '../../models/object.model';
import { normalizeForSearch } from '../../shared/normalize-text';

const MESSAGE_MAX_LENGTH = 250;

// First message of the chat when the helper leaves the offer message empty
const DEFAULT_CHAT_MESSAGE = 'Hi! I just offered to help with your request.';

interface Category {
	label: string;
	emoji: string;
}

const CATEGORIES: Category[] = [
	{ label: 'All', emoji: '👀' },
	{ label: 'DIY', emoji: '🛠️' },
	{ label: 'Electronics', emoji: '💻' },
	{ label: 'Leisure', emoji: '🎾' },
	{ label: 'Other', emoji: '📦' },
];

@Component({
	selector: 'app-offerHelp',
	imports: [TitleBarComponent, AvatarComponent, TextFieldComponent, ObjectMiniComponent, ChipComponent, ButtonDirective, ErrorBannerComponent],
	host: { class: 'flex flex-col flex-1' },
	templateUrl: './offerHelp.html',
})
export class OfferHelp implements OnInit {
	readonly modalService = inject(ModalService);
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private postsService = inject(PostsService);
	private objectService = inject(ObjectService);
	private lendingService = inject(LendingService);
	private usersService = inject(UsersService);
	private chatsService = inject(ChatsService);

	private postId = Number(this.route.snapshot.paramMap.get('postId'));
	readonly categories = CATEGORIES;

	readonly post = signal<PostEntity | null>(null);
	private author = signal<User | null>(null);
	private objects = signal<ObjectEntity[]>([]);
	readonly activeCategory = signal('All');
	readonly searchTerm = signal('');
	readonly selectedObjectId = signal<number | null>(null);
	private lendedFrom = signal('');
	private lendedTo = signal('');
	readonly message = signal('');
	readonly submitting = signal(false);
	readonly bannerErrors = signal<string[]>([]);


	readonly authorName = computed(() => this.author()?.username ?? '');

	readonly canOffer = computed(() => this.post()?.status === 'open');

	private availableObjects = computed(() =>
		this.objects().filter((object) => object.isAvailable)
	);

	private filteredObjects = computed(() => {
		const category = this.activeCategory();
		if (category === 'All')
			return (this.availableObjects());
		return (this.availableObjects().filter((object) => object.type === category));
	});

	readonly searchedObjects = computed(() => {
		const term = normalizeForSearch(this.searchTerm());
		if (term === '')
			return (this.filteredObjects());
		return (this.filteredObjects().filter((object) => normalizeForSearch(object.name).includes(term)));
	});


	constructor() {
		effect(() => {
			this.objectService.changes();
			untracked(() => this.loadMyObjects());
		});
	}

	ngOnInit(): void {
		this.loadPost();
	}

	private loadPost(): void {
		this.postsService.findOne(this.postId).subscribe({
			next: (post) => {
				this.post.set(post);
				if (post.deletedAt)
					this.showError('This request was deleted');
				else if (post.status !== 'open')
					this.showError('This request is closed, the requester already chose a helper');

				this.lendedFrom.set(post.fromDate);
				this.lendedTo.set(post.toDate);
				this.activeCategory.set(post.objectType);
				this.loadAuthor(post.ownerId);
			},
			error: (err: HttpErrorResponse) => {
				if (err.status === 404) {
					this.router.navigate(['/app/notFound'], { skipLocationChange: true });
					return;
				}
				this.showError('Could not load this request, please try again');
			},
		});
	}

	private loadAuthor(ownerId: number): void {
		this.usersService.findOne(ownerId).subscribe({
			next: (user) => this.author.set(user),
			error: () => this.showError('Could not load who posted this request'),
		});
	}

	private loadMyObjects(): void {
		this.objectService.findMy().subscribe({
			next: (objects) => this.objects.set(objects),
			error: () => this.showError('Could not load your items, please try again'),
		});
	}


	onSubmit(): void {
		const objectId = this.selectedObjectId();
		const post = this.post();
		if (this.submitting() || !this.isOfferValid(objectId))
			return;
		if (!post) {
			this.bannerErrors.set(['This request no longer exists']);
			return;
		}

		this.bannerErrors.set([]);
		this.submitting.set(true);
		this.lendingService.create({
			objectId,
			postId: this.postId,
			lendedFrom: this.lendedFrom(),
			lendedTo: this.lendedTo(),
			message: this.message() || undefined,
		})
			.pipe(
				// The offer opens a chat with the requester, about this post: false when only the chat failed
				switchMap(() => this.chatsService.create(post.ownerId, this.postId, this.message().trim() || DEFAULT_CHAT_MESSAGE).pipe(
					map(() => true),
					catchError(() => of(false)),
				)),
			)
			.subscribe({
				next: (chatCreated) => {
					if (chatCreated) {
						this.router.navigate(['/app/dashboard']);
						return;
					}
					// The offer exists anyway: say so, then leave with the button still disabled
					this.bannerErrors.set(['Your offer was sent, but the conversation could not be started']);
					setTimeout(() => this.router.navigate(['/app/dashboard']), 2500);
				},
				error: (err) => {
					this.submitting.set(false);
					this.bannerErrors.set([this.errorMessageOf(err)]);
				},
			});
	}

	openAddObjectModal(): void {
		this.modalService.openAddObject();
	}


	// Shows what is wrong with the offer in the banner, true when it can be sent
	private isOfferValid(objectId: number | null): objectId is number {
		if (objectId === null) {
			this.bannerErrors.set(['Please select an object to offer']);
			return (false);
		}
		if (this.message().length > MESSAGE_MAX_LENGTH) {
			this.bannerErrors.set([`Message must be ${MESSAGE_MAX_LENGTH} characters or less`]);
			return (false);
		}
		return (true);
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
