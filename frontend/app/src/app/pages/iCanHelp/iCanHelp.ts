import { Component, computed, inject, signal } from '@angular/core';
import { DatePicker } from '../../components/date-picker/date-picker';
import { ActivatedRoute, Router } from '@angular/router';
import { PostsService } from '../../services/posts.service';
import { LendingService } from '../../services/lending.service';
import { PostEntity } from '../../models/post.model';
import { LendingEntity } from '../../models/lending.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-iCanHelp',
  imports: [DatePipe],
  templateUrl: './iCanHelp.html',
})
export class ICanHelp {

  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private postsService = inject(PostsService);
  private lendingService = inject(LendingService);

  // ISO string ("2026-10-05"), '' until a date is picked
  readonly date = signal('');

  post = signal<PostEntity | null>(null);
  offers = signal<LendingEntity[]>([]);
  loading = signal(true);

  offersCount = computed(() => this.offers().length);

  hasAcceptedOffer = computed(() => this.offers().some((o) => o.status === 'accepted'));

  private loadOffers(postId: number) {
    this.lendingService.findByPostId(postId).subscribe({
      next: (offers) => {
        this.offers.set(offers);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnInit() {
    const postId = Number(this.route.snapshot.paramMap.get('id'));
    if (!postId) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.postsService.findOne(postId).subscribe({
      next: (post) => {
        this.post.set(post);
        this.loadOffers(postId);
      },
      error: () => this.router.navigate(['/dashboard']),
    });
  }

  goToOfferHelp() {
    this.router.navigate(['/offer-help', this.post()?.id]);
  }

}
