import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { AvatarComponent } from '../../components/avatar/avatar';
import { TagComponent } from '../../components/tag/tag';
import { ButtonDirective } from '../../components/button/button.directive';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostEntity, PostGroupData } from '../../models/post.model';
import { PostsService } from '../../services/posts.service';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';



@Component({
    selector: 'app-iCanHelp',
    imports: [TitleBarComponent, AvatarComponent, TagComponent, ButtonDirective, RouterLink],
    host: { class: 'flex flex-col flex-1' },
    templateUrl: './iCanHelp.html',
})
export class ICanHelp implements OnInit {

    private usersService = inject(UsersService);
    readonly author = signal<User | null>(null);
    readonly authorName = computed(() => this.author()?.username ?? '');

    private router = inject(Router);
    private route = inject(ActivatedRoute);
    readonly postId = Number(this.route.snapshot.paramMap.get('postId'));

    private postsService = inject(PostsService);
    readonly post = signal<PostEntity | null>(null);
    readonly errorMessage = signal<string | null>(null);

    readonly postGroups = signal<PostGroupData[]>([]);

    readonly groupName = computed(() => {
        const groups = this.postGroups();
        return groups.map((g) => g.name).join(', ') || 'Aucun groupe';
    });

    readonly hasChosenHelper = computed(() => this.post()?.status === 'closed');

    ngOnInit(): void {
        this.postsService.findOne(this.postId).subscribe({
            next: (post) => {
                this.post.set(post);
                this.usersService.findOne(post.ownerId).subscribe({
                    next: (user) => this.author.set(user),
                    error: (err) => console.error('Failed to load author', err),
                });
            },

            error: () => this.errorMessage.set('This request no longer exists'),
        });
        this.postsService.findGroups(this.postId).subscribe({
            next: (groups) => this.postGroups.set(groups),
            error: (err) => console.error('Failed to load post groups', err),
        });
    }

    readonly title = computed(() => this.post()?.title ?? '');
    readonly objectType = computed(() => this.post()?.objectType ?? '');
    readonly description = computed(() => this.post()?.description ?? '');
    readonly dateRangeLabel = computed(() => {
        const post = this.post();
        if (!post) return '';
        return `${this.formatDate(post.fromDate)} - ${this.formatDate(post.toDate)}`;
    });

    goToOfferHelp(): void {
        this.router.navigate(['/app/offerHelp', this.postId]);
    }

    private formatDate(dateIso: string): string {
        return new Date(dateIso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }

    readonly timeAgo = computed(() => {
        const post = this.post();
        if (!post) return '';
        const diffH = Math.floor((Date.now() - new Date(post.createdAt).getTime()) / 3_600_000);
        if (diffH < 1) return 'less than 1h ago';
        if (diffH < 24) return `${diffH}h ago`;
        return `${Math.floor(diffH / 24)}d ago`;
    });

}