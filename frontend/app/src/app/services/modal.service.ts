import { Injectable, signal } from '@angular/core';

export type ModalKind = 'addObject' | 'addPost' | 'addGroup' | 'editProfile' | 'myRequest' | 'myOffer' | null;

@Injectable({ providedIn: 'root' })
export class ModalService {
	readonly activeModal = signal<ModalKind>(null);
	readonly editObjectId = signal<number | null>(null);
	readonly editPostId = signal<number | null>(null);
	readonly editGroupId = signal<number | null>(null);
	readonly myRequestPostId = signal<number | null>(null);
	readonly myOfferLendingId = signal<number | null>(null);

	openAddObject(): void {
		this.editObjectId.set(null);
		this.activeModal.set('addObject');
	}

	openEditObject(id: number): void {
		this.editObjectId.set(id);
		this.activeModal.set('addObject');
	}

	openAddPost(): void {
		this.editPostId.set(null);
		this.activeModal.set('addPost');
	}

	openEditPost(id: number): void {
		this.editPostId.set(id);
		this.activeModal.set('addPost');
	}

	openAddGroup(): void {
		this.editGroupId.set(null);
		this.activeModal.set('addGroup');
	}

	openEditGroup(id: number): void {
		this.editGroupId.set(id);
		this.activeModal.set('addGroup');
	}

	openEditProfile(): void {
		this.activeModal.set('editProfile');
	}

	openMyRequest(postId: number): void {
		this.myRequestPostId.set(postId);
		this.activeModal.set('myRequest');
	}

	openMyOffer(lendingId: number): void {
		this.myOfferLendingId.set(lendingId);
		this.activeModal.set('myOffer');
	}

	close(): void {
		this.activeModal.set(null);
		this.editObjectId.set(null);
		this.editPostId.set(null);
		this.editGroupId.set(null);
		this.myRequestPostId.set(null);
		this.myOfferLendingId.set(null);
	}
}