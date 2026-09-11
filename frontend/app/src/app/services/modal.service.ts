import { Injectable, signal } from '@angular/core';

export type ModalKind = 'addObject' | 'request' | 'group' | null;

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly activeModal = signal<ModalKind>(null);
  readonly editObjectId = signal<number | null>(null);

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

  openGroup(): void {
    this.activeModal.set('group');
  }

  close(): void {
    this.activeModal.set(null);
    this.editObjectId.set(null);
  }
}