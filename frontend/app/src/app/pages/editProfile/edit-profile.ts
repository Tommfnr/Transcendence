import { Component, inject } from '@angular/core';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { RefreshService } from '../../services/refresh.service';
import { ButtonDirective } from '../../components/button/button.directive';

@Component({
    selector: 'app-editProfile',
    imports: [Modal, TextFieldComponent, ButtonDirective],
    templateUrl: './edit-profile.html',
    styles: ``,
})

export class EditProfile {
	readonly modalService = inject(ModalService);
	readonly refreshService = inject(RefreshService);
	readonly user = this.refreshService.user;

	onSubmit(event: Event): void {
		event.preventDefault();
		// TODO wiring
		this.modalService.close();
	}
}
