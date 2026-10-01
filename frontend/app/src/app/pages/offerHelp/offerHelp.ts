import { Component, computed, signal, inject } from '@angular/core';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { AvatarComponent } from '../../components/avatar/avatar';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { ObjectMiniComponent } from '../../components/object-mini/object-mini';
import { ChipComponent } from '../../components/chip/chip';
import { ButtonDirective } from '../../components/button/button.directive';
import { ModalService } from '../../services/modal.service';
import { normalizeForSearch } from '../../shared/normalize-text';

interface Category {
	label: string;
	emoji: string;
}

@Component({
	selector: 'app-offerHelp',
	imports: [ TitleBarComponent, AvatarComponent, TextFieldComponent, ObjectMiniComponent, ChipComponent, ButtonDirective],
	host: { class: 'flex flex-col flex-1' },
	templateUrl: './offerHelp.html',
})
export class OfferHelp {

	readonly modalService = inject(ModalService);

	readonly demoItems = [
		{ id: 1, name: 'Drill', type: 'DIY' },
		{ id: 2, name: 'Ladder', type: 'DIY' },
		{ id: 3, name: 'Wrench set', type: 'DIY' },
		{ id: 4, name: 'Hammer', type: 'DIY' },
	];
	readonly selectedObjectId = signal<number | null>(null);

	categories: Category[] = [
		{ label: 'All', emoji: '👀' },
		{ label: 'DIY', emoji: '🛠️' },
		{ label: 'Electronics', emoji: '💻' },
		{ label: 'Leisure', emoji: '🎾' },
		{ label: 'Other', emoji: '📦' },
	]
	// TODO(wiring): initialize with the category of the request being answered
	activeCategory = signal('DIY');
	readonly searchTerm = signal('');

	readonly filteredItems = computed(() => {
		const category = this.activeCategory();
		if (category === 'All') {
			return this.demoItems;
		}
		return this.demoItems.filter((item) => item.type === category);
	});

	readonly searchItems = computed(() => {
		const term = normalizeForSearch(this.searchTerm());
		if (term === '') {
			return this.filteredItems();
		}
		return this.filteredItems().filter((item) =>
			normalizeForSearch(item.name).includes(term)
		);
	});

	openAddObjectModal(): void {
		this.modalService.openAddObject();
	}

}
