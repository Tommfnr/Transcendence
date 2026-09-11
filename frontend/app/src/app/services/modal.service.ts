import { Injectable, signal } from '@angular/core';

export type ModalKind = 'addObject' | 'request' | 'addGroup' | null;

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly activeModal = signal<ModalKind>(null);
  readonly editObjectId = signal<number | null>(null);
  readonly editGroupId = signal<number | null>(null);

  openAddObject(): void {
    this.editObjectId.set(null);
    this.activeModal.set('addObject');
  }

  openEditObject(id: number): void {
    this.editObjectId.set(id);
    this.activeModal.set('addObject');
  }

  openRequest(): void {
    this.activeModal.set('request');
  }

  openAddGroup(): void {
    this.editGroupId.set(null);
    this.activeModal.set('addGroup');
  }

  openEditGroup(id: number): void {
    this.editGroupId.set(id);
    this.activeModal.set('addGroup');
  }

  close(): void {
    this.activeModal.set(null);
    this.editObjectId.set(null);
    this.editGroupId.set(null);
  }
}