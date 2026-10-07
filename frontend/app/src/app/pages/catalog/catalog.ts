import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ObjectService } from '../../services/object.service';
import { ObjectEntity } from '../../models/object.model';
import { ModalService } from '../../services/modal.service';
import { TextFieldComponent } from "../../components/text-field/text-field";
import { ChipComponent } from "../../components/chip/chip";
import { ObjectCard } from '../../components/object-card/object-card';
import { normalizeForSearch } from '../../shared/normalize-text';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { FabActionComponent } from '../../components/fab-action/fab-action';
import { Location, provideCloudflareLoader } from '@angular/common';

interface Category {
	label: string;
	emoji: string;
}

@Component({
	selector: 'app-catalog',
	imports: [ TextFieldComponent, ChipComponent, ObjectCard, TitleBarComponent, FabActionComponent],
	templateUrl: './catalog.html',
})


export class Catalog {
  private objectService = inject(ObjectService);
  readonly modalService = inject(ModalService);
  readonly objectData = signal<ObjectEntity[]>([]);
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
		this.objectService.findMy().subscribe((data) => { this.objectData.set(data); });
	}

	deleteObject(id: number): void {
		const name = this.objectData().find((object) => object.id === id)?.name;
		if (confirm(`Delete "${name}"? This cannot be undone.`)) {
			this.objectService.remove(id).subscribe(() => {
				this.objectData.update((objects) => objects.filter((object) => object.id !== id));
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