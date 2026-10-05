import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { AvatarComponent } from '../../components/avatar/avatar';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { ObjectMiniComponent } from '../../components/object-mini/object-mini';
import { ButtonDirective } from '../../components/button/button.directive';
import { PostsService } from '../../services/posts.service';
import { ObjectService } from '../../services/object.service';
import { LendingService } from '../../services/lending.service';
import { UsersService } from '../../services/users.service';
import { PostEntity } from '../../models/post.model';
import { ObjectEntity } from '../../models/object.model';
import { User } from '../../models/user.model';
import { ChipComponent } from '../../components/chip/chip';
import { ModalService } from '../../services/modal.service';
import { normalizeForSearch } from '../../shared/normalize-text';

const MESSAGE_MAX_LENGTH = 250;

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
    readonly modalService = inject(ModalService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private postsService = inject(PostsService);
    private objectService = inject(ObjectService);
    private lendingService = inject(LendingService);
    private usersService = inject(UsersService);

    private readonly postId = Number(this.route.snapshot.paramMap.get('postId'));

    readonly post = signal<PostEntity | null>(null);
    readonly author = signal<User | null>(null);
    readonly authorName = computed(() => this.author()?.username ?? '');
    readonly objects = signal<ObjectEntity[]>([]);
    readonly availableObjects = computed(() =>
        this.objects().filter((object) => object.isAvailable),
    );

    readonly categories: Category[] = [
    { label: 'All', emoji: '👀' },
    { label: 'DIY', emoji: '🛠️' },
    { label: 'Electronics', emoji: '💻' },
    { label: 'Leisure', emoji: '🎾' },
    { label: 'Other', emoji: '📦' },
];
    readonly activeCategory = signal('All');
    readonly searchTerm = signal('');

    readonly filteredObjects = computed(() => {
        const category = this.activeCategory();
        if (category === 'All')
            return this.availableObjects();
        return this.availableObjects().filter((object) => object.type === category);
    });

    readonly searchedObjects = computed(() => {
        const term = normalizeForSearch(this.searchTerm());
        if (term === '')
            return this.filteredObjects();
        return this.filteredObjects().filter((object) => normalizeForSearch(object.name).includes(term));
    });

    readonly selectedObjectId = signal<number | null>(null);
    readonly lendedFrom = signal('');
    readonly lendedTo = signal('');
    readonly message = signal('');

    readonly submitting = signal(false);
    readonly bannerErrors = signal<string[]>([]);

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
                this.activeCategory.set(post.objectType);
            },
            error: () => this.bannerErrors.set(['This request no longer exists']),
        });

        this.objectService.findMy().subscribe((objects) => this.objects.set(objects));
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
    
    openAddObjectModal(): void {
        this.modalService.openAddObject();
    }
}


