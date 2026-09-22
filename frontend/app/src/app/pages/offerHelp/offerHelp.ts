import { Component, signal, inject } from '@angular/core';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { AvatarComponent } from '../../components/avatar/avatar';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { ObjectMiniComponent } from '../../components/object-mini/object-mini';
import { ButtonDirective } from '../../components/button/button.directive';
import { ModalService } from '../../services/modal.service';


@Component({
	selector: 'app-offerHelp',
	imports: [ TitleBarComponent, AvatarComponent, TextFieldComponent, ObjectMiniComponent, ButtonDirective],
	host: { class: 'flex flex-col flex-1' },
	templateUrl: './offerHelp.html',
})
export class OfferHelp {

	readonly modalService = inject(ModalService);

	readonly demoItems = [
		{ id: 1, name: 'Drill' },
		{ id: 2, name: 'Ladder' },
		{ id: 3, name: 'Wrench set' },
		{ id: 4, name: 'Hammer' },
	];
	readonly selectedObjectId = signal<number | null>(null);

	readonly fabOpen = signal(false);

	openAddObjectModal(): void {
		this.modalService.openAddObject();
	}

}
