import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { form, FormField, required, validate, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RefreshService } from '../../services/refresh.service';
import { LoginData } from '../../models/login-data.model';
import { ButtonDirective } from '../../components/button/button.directive';
import { TextFieldComponent } from '../../components/text-field/text-field';
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';
import { isAuthError, isZodValidationError, mapAuthErrorToBanner, mapZodErrorsToFieldTree } from '../../shared/zod-signal-errors';
import { EMAIL_PATTERN, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from '../../shared/field-rules';

@Component({
	selector: 'app-login',
	imports: [FormField, ButtonDirective, TextFieldComponent, RouterLink, ErrorBannerComponent],
	templateUrl: './login.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
	private refreshService = inject(RefreshService);
	private router = inject(Router);

	readonly bannerErrors = signal<string[]>([]);
	private loginModel = signal<LoginData>({
		identifier: '',
		password: '',
	});

	readonly loginForm = form(this.loginModel, (fieldPath) => {
		required(fieldPath.identifier, { message: 'Username or email is required' });
		validate(fieldPath.identifier, ({ value }) => {
			const identifier = value().trim();
			if (identifier === '')
				return (undefined);
			const isValid = identifier.includes('@')
				? EMAIL_PATTERN.test(identifier)
				: identifier.length >= USERNAME_MIN_LENGTH && identifier.length <= USERNAME_MAX_LENGTH && USERNAME_PATTERN.test(identifier);
			return (isValid ? undefined : ({ kind: 'identifier', message: 'Invalid username or email' }));
		});

		required(fieldPath.password, { message: 'Password is required' });
	});


	onSubmit(event: Event): void {
		event.preventDefault();

		submit(this.loginForm, async (field) => {
			const { identifier, password } = this.loginModel();

			this.bannerErrors.set([]);
			try {
				await firstValueFrom(this.refreshService.login({ identifier, password }));
				await firstValueFrom(this.refreshService.getMe());
				this.router.navigate(['/app']);
			}
			catch (err) {
				if (isZodValidationError(err)) {
					const { fieldErrors, bannerErrors } = mapZodErrorsToFieldTree(err.error, field);
					this.bannerErrors.set(bannerErrors);
					return (fieldErrors);
				}
				if (isAuthError(err))
					this.bannerErrors.set(mapAuthErrorToBanner(err.error).bannerErrors);
				else
					this.bannerErrors.set(['Something went wrong, please try again']);
			}
			return (undefined);
		});
	}
}
