import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Modal } from '../../components/modal/modal';
import { DatePicker } from '../../components/date-picker/date-picker';
import { ButtonComponent } from '../../components/button/button';
import { PostsService } from '../../services/posts.service';
import { ObjectService } from '../../services/object.service';
import { LendingService } from '../../services/lending.service';
import { PostEntity } from '../../models/post.model';
import { ObjectEntity } from '../../models/object.model';

@Component({
    selector: 'app-iCanHelp',
    imports: [Modal, DatePicker, ButtonComponent],
    templateUrl: './iCanHelp.html',
})
export class ICanHelp implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private postsService = inject(PostsService);
    private objectService = inject(ObjectService);
    private lendingService = inject(LendingService);

    private readonly postId = Number(this.route.snapshot.paramMap.get('postId'));

    readonly post = signal<PostEntity | null>(null);
    readonly objects = signal<ObjectEntity[]>([]);
    readonly availableObjects = computed(() =>
        this.objects().filter((object) => object.isAvailable),
    );

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
            },
            error: () => this.bannerErrors.set(['This request no longer exists']),
        });

        this.objectService.findMy().subscribe((objects) => this.objects.set(objects));
    }

    onObjectChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value;
        this.selectedObjectId.set(value === '' ? null : Number(value));
    }

    onMessageChange(event: Event): void {
        this.message.set((event.target as HTMLTextAreaElement).value);
    }

    onCancel(): void {
        this.router.navigate(['/app/dashboard']);
    }

    async onSubmit(event: Event): Promise<void> {
        event.preventDefault();

        if (this.submitting()) return;

        const objectId = this.selectedObjectId();

        if (!objectId) {
            this.bannerErrors.set(['Please select an object to offer']);
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
        } catch (err) {
            if (err instanceof HttpErrorResponse && typeof err.error?.message === 'string')
                this.bannerErrors.set([err.error.message]);
            else this.bannerErrors.set(['Something went wrong, please try again']);
        } finally {
            this.submitting.set(false);
        }
    }
}
