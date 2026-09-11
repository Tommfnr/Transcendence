import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ObjectService } from '../../services/object.service';
import { ObjectEntity } from '../../models/object.model';
import { ButtonComponent } from '../../components/button/button';
import { ButtonDirective } from '../../components/button/button.directive';
import { TextFieldComponent } from "../../components/text-field/text-field";
import { ChipComponent } from "../../components/chip/chip";
import { ObjectCard } from '../../components/object-card/object-card';

interface Category {
	label: string;
	emoji: string;
}

@Component({
	selector: 'app-catalog',
	imports: [RouterLink, ButtonComponent, ButtonDirective, TextFieldComponent, ChipComponent, ObjectCard],
	templateUrl: './catalog.html',
})


export class Catalog implements OnInit {
  private objectService = inject(ObjectService);
  readonly objectData = signal<ObjectEntity[]>([]);

	ngOnInit(): void {
		this.objectService.findMy().subscribe((data) => { this.objectData.set(data); });
	}

	deleteObject(id: number): void {
		this.objectService.remove(id).subscribe(() => {
			this.objectData.update((objects) => objects.filter((object) => object.id !== id));
		});
	}

	categories: Category[] = [
		{ label: 'All', emoji: '👀' },
		{ label: 'Tools', emoji: '🛠️' },
		{ label: 'Electronics', emoji: '💻' },
		{ label: 'Vehicles', emoji: '🚗' },
		{ label: 'Outdoor & Recreation', emoji: '🏕️' },
		{ label: 'Media', emoji: '🎬' },
		{ label: 'Events', emoji: '🎉' },
		{ label: 'Clothing & Gear', emoji: '🧥' },
	]
	activeCategory = signal('All');

	readonly filteredObjects = computed(() => {
		const category = this.activeCategory();
		if (category === 'All') {
			return this.objectData();
		}
		return this.objectData().filter((object) => object.type === category);
	});
}