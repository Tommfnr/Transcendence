import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ObjectService } from '../../services/object.service';
import { ObjectData } from '../../models/object-data.model';
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
	readonly objectData = signal<ObjectData[]>([]);

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
		{ label: 'DIY', emoji: '🛠️' },
		{ label: 'Garden', emoji: '🌱' },
		{ label: 'Electronic', emoji: '💻' },
		{ label: 'Leisure', emoji: '🎮' },
		{ label: 'Other', emoji: '📦' }
	]
	activeCategory = signal('DIY');
}