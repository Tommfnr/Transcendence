import { Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ObjectService } from '../../services/object.service';
import { LendingService } from '../../services/lending.service';
import { ObjectEntity } from '../../models/object.model';
import { ModalService } from '../../services/modal.service';
import { TextFieldComponent } from "../../components/text-field/text-field";
import { ChipComponent } from "../../components/chip/chip";
import { ObjectCard } from '../../components/object-card/object-card';
import { normalizeForSearch } from '../../shared/normalize-text';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { FabActionComponent } from '../../components/fab-action/fab-action';
import { Location } from '@angular/common';
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';
import { LendingEntity } from '../../models/lending.model';

interface Category {
	label: string;
	emoji: string;
}

@Component({
	selector: 'app-catalog',
	imports: [ TextFieldComponent, ChipComponent, ObjectCard, TitleBarComponent, FabActionComponent, ErrorBannerComponent],
	templateUrl: './catalog.html',
})


export class Catalog {
  private objectService = inject(ObjectService);
  readonly modalService = inject(ModalService);
  private lendingService = inject(LendingService);
  readonly objectData = signal<ObjectEntity[]>([]);
  readonly bannerErrors = signal<string[]>([]);
  readonly loadFailed = signal(false);
  private location = inject(Location);
  private router = inject(Router);

	constructor() {
		// runs on init, then again whenever an object is created/updated
		effect(() => {
			this.objectService.changes();
			this.loadObjects();
		});
	}

	private loadObjects(): void {
		this.bannerErrors.set([]);
		this.loadFailed.set(false);
		const loans$ = this.lendingService.listAll().pipe(
			catchError(() => {
				this.showError('Could not check which items are lent');
				return of([] as LendingEntity[]);
			}),
		);

		forkJoin([this.objectService.findMy(), loans$]).subscribe({
			next: ([objects, loans]) => {
				const lentIds = loans
					.filter((loan) => ['active', 'overdue', 'awaiting_confirmation'].includes(loan.status))
					.map((loan) => loan.objectId);
				this.objectData.set(objects.map((object) =>
					lentIds.includes(object.id) ? { ...object, isAvailable: false } : object));
			},
			error: () => {
				this.loadFailed.set(true);
				this.showError('Could not load your items');
			},
		});
	}

	private showError(message: string): void {
		this.bannerErrors.update((errors) => errors.includes(message) ? errors : [...errors, message]);
	}

	deleteObject(id: number): void {
		const name = this.objectData().find((object) => object.id === id)?.name;
		if (confirm(`Delete "${name}"? This cannot be undone.`)) {
			this.objectService.remove(id).subscribe({
				next: () => {
					this.objectData.update((objects) => objects.filter((object) => object.id !== id));
					if (this.currentPage() > this.totalPages()) {
						this.currentPage.set(this.totalPages());
					}
				},
				error: () => this.showError(`Could not delete "${name}"`),
			});
		}
	}

	categories: Category[] = [
		{ label: 'All', emoji: '👀' },
		{ label: 'DIY', emoji: '🛠️' },
		{ label: 'Electronics', emoji: '💻' },
		{ label: 'Leisure', emoji: '🎾' },
		{ label: 'Other', emoji: '📦' },
	]
	activeCategory = signal('All');
	readonly searchTerm = signal('');

	readonly filteredObjects = computed(() => {
		const category = this.activeCategory();
		if (category === 'All') {
			return this.objectData();
		}
		return this.objectData().filter((object) => object.type === category);
	});

	readonly searchObjects = computed(() => {
		const term = normalizeForSearch(this.searchTerm());
		if (term === '') {
			return this.filteredObjects();
		}
		return this.filteredObjects().filter((object) =>
			normalizeForSearch(object.name).includes(term)
			|| (object.description !== null && normalizeForSearch(object.description).includes(term))
		);
	});

	readonly sortAsc = signal(true);

	readonly sortedObjects = computed(() => {
		const direction = this.sortAsc() ? 1 : -1;
		return [...this.searchObjects()].sort(
			(a, b) => direction * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
		);
	});

	readonly objectsCount = computed(() => this.searchObjects().length);

	toggleSort(): void {
		this.sortAsc.update((asc) => !asc);
	}

	readonly pageSize = 8;

	// back to page 1 whenever search, category or sort changes
	readonly currentPage = linkedSignal({
		source: () => [this.searchTerm(), this.activeCategory(), this.sortAsc()],
		computation: () => 1,
	});

	readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sortedObjects().length / this.pageSize)));

	readonly pagedObjects = computed(() => {
		const start = (this.currentPage() - 1) * this.pageSize;
		return this.sortedObjects().slice(start, start + this.pageSize);
	});

	readonly hasPrev = computed(() => this.currentPage() > 1);
	readonly hasNext = computed(() => this.currentPage() < this.totalPages());

	prevPage(): void {
		if (this.hasPrev()) {
			this.currentPage.update((page) => page - 1);
		}
	}

	nextPage(): void {
		if (this.hasNext()) {
			this.currentPage.update((page) => page + 1);
		}
	}

	readonly fabOpen = signal(false);

	toggleFab(): void {
		this.fabOpen.update(open => !open);
	}

	closeFab(): void {
		this.fabOpen.set(false);
	}

	openAddObjectModal(): void {
    	this.closeFab();
    	this.modalService.openAddObject();
	}

}