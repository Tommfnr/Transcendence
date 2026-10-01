import { Component, computed, signal, inject } from '@angular/core';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { AvatarComponent } from '../../components/avatar/avatar';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { ObjectMiniComponent } from '../../components/object-mini/object-mini';
import { ChipComponent } from '../../components/chip/chip';
import { ButtonDirective } from '../../components/button/button.directive';
import { PostsService } from '../../services/posts.service';
import { ObjectService } from '../../services/object.service';
import { LendingService } from '../../services/lending.service';
import { UsersService } from '../../services/users.service';
import { ModalService } from '../../services/modal.service';
import { normalizeForSearch } from '../../shared/normalize-text';

interface Category {
	label: string;
	emoji: string;
}

@Component({
	selector: 'app-offerHelp',
	imports: [ TitleBarComponent, AvatarComponent, TextFieldComponent, ObjectMiniComponent, ChipComponent, ButtonDirective],
	host: { class: 'flex flex-col flex-1' },
	templateUrl: './offerHelp.html',
})
export class OfferHelp implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private postsService = inject(PostsService);
    private objectService = inject(ObjectService);
    private lendingService = inject(LendingService);
    private usersService = inject(UsersService);
    readonly modalService = inject(ModalService);

    private readonly postId = Number(this.route.snapshot.paramMap.get('postId'));

	readonly demoItems = [
		{ id: 1, name: 'Drill', type: 'DIY' },
		{ id: 2, name: 'Ladder', type: 'DIY' },
		{ id: 3, name: 'Wrench set', type: 'DIY' },
		{ id: 4, name: 'Hammer', type: 'DIY' },
	];
	readonly selectedObjectId = signal<number | null>(null);

	categories: Category[] = [
		{ label: 'All', emoji: '👀' },
		{ label: 'DIY', emoji: '🛠️' },
		{ label: 'Electronics', emoji: '💻' },
		{ label: 'Leisure', emoji: '🎾' },
		{ label: 'Other', emoji: '📦' },
	]
	// TODO(wiring): initialize with the category of the request being answered
	activeCategory = signal('DIY');
	readonly searchTerm = signal('');

	readonly filteredItems = computed(() => {
		const category = this.activeCategory();
		if (category === 'All') {
			return this.demoItems;
		}
		return this.demoItems.filter((item) => item.type === category);
	});

	readonly searchItems = computed(() => {
		const term = normalizeForSearch(this.searchTerm());
		if (term === '') {
			return this.filteredItems();
		}
		return this.filteredItems().filter((item) =>
			normalizeForSearch(item.name).includes(term)
		);
	});

    readonly submitting = signal(false);
    readonly bannerErrors = signal<string[]>([]);

    constructor() {
        // Reload the catalog when the add-object modal closes so a new item shows up.
        effect(() => {
            if (this.modalService.activeModal() === null)
                untracked(() => this.loadObjects());
        });
    }

    ngOnInit(): void {
        this.postsService.findOne(this.postId).subscribe({
            next: (post) => {
                this.post.set(post);
                this.lendedFrom.set(post.fromDate);
                this.lendedTo.set(post.toDate);
                this.usersService.findOne(post.ownerId).subscribe({
                    next: (user) => this.author.set(user),
                    error: (err) => console.error('Failed to load author', err),
                });
            },
            error: () => this.bannerErrors.set(['This request no longer exists']),
        });
    }

    private loadObjects(): void {
        this.objectService.findMy().subscribe((objects) => this.objects.set(objects));
    }

    openAddObjectModal(): void {
        this.modalService.openAddObject();
    }

    async onSubmit(): Promise<void> {
        if (this.submitting()) return;

        const objectId = this.selectedObjectId();

        if (!objectId) {
            this.bannerErrors.set(['Please select an object to offer']);
            return;
        }

        if (this.message().length > MESSAGE_MAX_LENGTH) {
            this.bannerErrors.set([`Message must be ${MESSAGE_MAX_LENGTH} characters or less`]);
            return;
        }

        this.bannerErrors.set([]);
        this.submitting.set(true);

        try {
            await firstValueFrom(
                this.lendingService.create({
                    objectId,
                    postId: this.postId,
                    lendedFrom: this.lendedFrom(),
                    lendedTo: this.lendedTo(),
                    message: this.message() || undefined,
                }),
            );
            this.router.navigate(['/app/dashboard']);
        }
        catch (err) {
            if (err instanceof HttpErrorResponse && typeof err.error?.message === 'string')
                this.bannerErrors.set([err.error.message]);
            else 
                this.bannerErrors.set(['Something went wrong, please try again']);
        }
        finally {
            this.submitting.set(false);
        }
    }
}
