import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { form, FormField, required, minLength, maxLength, pattern, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { RefreshService } from '../../services/refresh.service';
import { ButtonDirective } from '../../components/button/button.directive';
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';
import { UserInput } from '../../models/user.model';
import { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_PATTERN } from '../../shared/field-rules';

@Component({
    selector: 'app-editProfile',
    imports: [FormField, Modal, TextFieldComponent, ButtonDirective, ErrorBannerComponent],
    templateUrl: './edit-profile.html',
    styles: ``,
})

export class EditProfile {
	readonly modalService = inject(ModalService);
	readonly refreshService = inject(RefreshService);
	readonly user = this.refreshService.user;

	bannerErrors = signal<string[]>([]);

	profile = signal<UserInput>({
		username: this.user()?.username ?? '',
	});

	profileForm = form(this.profile, (fieldPath) => {
		required(fieldPath.username, { message: 'Username is required' });
		minLength(fieldPath.username, USERNAME_MIN_LENGTH, { message: `Min ${USERNAME_MIN_LENGTH} characters` });
		maxLength(fieldPath.username, USERNAME_MAX_LENGTH, { message: `Max ${USERNAME_MAX_LENGTH} characters` });
		pattern(fieldPath.username, USERNAME_PATTERN, { message: 'Only letters, digits, or _, -' });
	});

	onSubmit(event: Event): void {
		event.preventDefault();

		submit(this.profileForm, async (field) => {
			if (this.profile().username === this.user()?.username) {
				this.modalService.close();
				return (undefined);
			}

			try {
				this.bannerErrors.set([]);
				await firstValueFrom(this.refreshService.updateMe(this.profile()));
				this.modalService.close();
				return (undefined);
			}
			catch (err) {
				// The backend answers 400 "Invalid username" or 409 "Username already taken"
				if (err instanceof HttpErrorResponse && (err.status === 400 || err.status === 409)
					&& typeof err.error?.message === 'string')
					return ([{ fieldTree: field.username, kind: 'server', message: err.error.message }]);
				this.bannerErrors.set(['Something went wrong, please try again']);
				return (undefined);
			}
		});
	}
}
