import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { form, FormField, required, minLength, maxLength, pattern, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RefreshService } from '../../services/refresh.service';
import { RegisterData } from '../../models/register-data.model';
import { ButtonDirective } from '../../components/button/button.directive';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';
import { isZodValidationError, mapZodErrorsToFieldTree, isConflictError, mapAuthErrorToBanner } from '../../shared/zod-signal-errors';
import { EMAIL_MAX_LENGTH, EMAIL_PATTERN, PASSWORD_PATTERN, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from '../../shared/field-rules';

@Component({
	selector: 'app-register',
	imports: [FormField, ButtonDirective, TextFieldComponent, ErrorBannerComponent, RouterLink],
	templateUrl: './register.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
	private authService = inject(AuthService);
	private refreshService = inject(RefreshService);
	private router = inject(Router);

	readonly registrationSuccess = signal(false);
	readonly bannerErrors = signal<string[]>([]);
	private registerModel = signal<RegisterData>({
		email: '',
		username: '',
		h_password: '',
	});

	readonly registerForm = form(this.registerModel, (fieldPath) => {
		required(fieldPath.email, { message: 'Email is required' });
		pattern(fieldPath.email, EMAIL_PATTERN, { message: 'Invalid email format' });
		maxLength(fieldPath.email, EMAIL_MAX_LENGTH, { message: 'Email too long' });

		required(fieldPath.username, { message: 'Username is required' });
		minLength(fieldPath.username, USERNAME_MIN_LENGTH, { message: `Min ${USERNAME_MIN_LENGTH} characters` });
		maxLength(fieldPath.username, USERNAME_MAX_LENGTH, { message: `Max ${USERNAME_MAX_LENGTH} characters` });
		pattern(fieldPath.username, USERNAME_PATTERN, { message: 'Only letters, digits, or _, -' });

		required(fieldPath.h_password, { message: 'Password is required' });
		pattern(fieldPath.h_password, PASSWORD_PATTERN, { message: 'Password does not meet the requirements' });
	});


	onSubmit(event: Event): void {
		event.preventDefault();

		submit(this.registerForm, async (field) => {
			const { email, username, h_password } = this.registerModel();

			this.bannerErrors.set([]);
			try {
				await firstValueFrom(this.authService.register({ username, email, h_password }));
			}
			catch (err) {
				if (isZodValidationError(err)) {
					const { fieldErrors, bannerErrors } = mapZodErrorsToFieldTree(err.error, field);
					this.bannerErrors.set(bannerErrors);
					return (fieldErrors);
				}
				if (isConflictError(err))
					this.bannerErrors.set(mapAuthErrorToBanner(err.error).bannerErrors);
				else
					this.bannerErrors.set(['Could not create your account, please try again']);
				return (undefined);
			}

			// The account exists: log in right away, or send to the login page if that fails
			try {
				await firstValueFrom(this.refreshService.login({ identifier: username, password: h_password }));
				await firstValueFrom(this.refreshService.getMe());
				this.router.navigate(['/app']);
			}
			catch {
				this.registrationSuccess.set(true);
				setTimeout(() => this.router.navigate(['/login']), 2500);
			}
			return (undefined);
		});
	}
}
