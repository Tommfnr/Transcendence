import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { PostsService } from '../../services/posts.service';
import { PostEntity } from '../../models/post.model';
import { ObjectService } from '../../services/object.service';
import { ObjectEntity } from '../../models/object.model';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';
import { LendingService } from '../../services/lending.service';
import { LendingEntity, LendingStatus } from '../../models/lending.model';
import { LENDING_STATUS_DISPLAY } from '../../models/exchange.model';
import { ButtonDirective } from '../../components/button/button.directive';
import { finalize } from 'rxjs';
import { formatTimeAgo } from '../../shared/date-format';

const LOAN_IN_PROGRESS: LendingStatus[] = ['accepted', 'active', 'awaiting_confirmation', 'overdue'];

@Component({
	selector: 'app-myOffer',
	standalone: true,
	imports: [Modal, ButtonDirective],
	templateUrl: './myOffer.html',
})
export class MyOffer implements OnInit {
	readonly modalService = inject(ModalService);
	private router = inject(Router);
	private postsService = inject(PostsService);
	private objectService = inject(ObjectService);
	private usersService = inject(UsersService);
	private lendingService = inject(LendingService);


	readonly post = signal<PostEntity | null>(null);
	readonly object = signal<ObjectEntity | null>(null);
	readonly requester = signal<User | null>(null);
	readonly lending = signal<LendingEntity | null>(null);
	readonly cancelling = signal(false);
	readonly returned = signal(false);
	readonly errorMessage = signal<string | null>(null);


	readonly statusLabel = computed(() => {
		const lending = this.lending();
		return (lending ? LENDING_STATUS_DISPLAY[lending.status].label : '');
	});

	readonly sentAgo = computed(() => {
		const lending = this.lending();
		return (lending ? formatTimeAgo(lending.createdAt) : '');
	});

	readonly canCancel = computed(() => this.lending()?.status === 'pending');

	readonly canReturn = computed(() => {
		const lending = this.lending();
		return (lending !== null && LOAN_IN_PROGRESS.includes(lending.status));
	});


	ngOnInit(): void {
		const lendingId = this.modalService.myOfferLendingId();
		if (lendingId === null)
			return;

		this.loadLending(lendingId);
	}

	private loadLending(lendingId: number): void {
		this.lendingService.findOne(lendingId).subscribe({
			next: (lending) => {
				this.lending.set(lending);
				this.loadObject(lending.objectId);
				this.loadRequester(lending.borrowerId);
				if (lending.postId !== null)
					this.loadPost(lending.postId);
			},
			error: () => this.errorMessage.set('This offer no longer exists'),
		});
	}

	private loadPost(postId: number): void {
		this.postsService.findOne(postId).subscribe({
			next: (post) => this.post.set(post),
			error: () => this.errorMessage.set('Could not load the request'),
		});
	}

	private loadObject(objectId: number): void {
		this.objectService.findOne(objectId).subscribe({
			next: (object) => this.object.set(object),
			error: () => this.errorMessage.set('Could not load the offered item'),
		});
	}

	private loadRequester(userId: number): void {
		this.usersService.findOne(userId).subscribe({
			next: (user) => this.requester.set(user),
			error: () => this.errorMessage.set('Could not load who posted the request'),
		});
	}


	onCancel(): void {
		const lending = this.lending();
		if (!lending || this.cancelling())
			return;

		this.errorMessage.set(null);
		this.cancelling.set(true);
		this.lendingService.cancel(lending.id)
			.pipe(finalize(() => this.cancelling.set(false)))
			.subscribe({
				next: () => this.modalService.close(),
				error: () => this.errorMessage.set('Could not cancel this offer, please try again'),
			});
	}

	onReturn(): void {
		const lending = this.lending();
		if (!lending || this.returned())
			return;

		this.errorMessage.set(null);
		this.returned.set(true);
		this.lendingService.returned(lending.id)
			.pipe(finalize(() => this.returned.set(false)))
			.subscribe({
				next: () => this.modalService.close(),
				error: () => this.errorMessage.set('Could not confirm the return, please try again'),
			});
	}


	// The chat of an offer is the one about its post with the requester
	onOpenConversation(): void {
		const lending = this.lending();
		this.modalService.close();
		this.router.navigate(['/app/chats'], {
			queryParams: lending ? { post: lending.postId, with: lending.borrowerId } : {},
		});
	}
}
