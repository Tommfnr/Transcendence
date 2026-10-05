import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { form, FormField, required, email, submit } from '@angular/forms/signals';
import { AuthService } from '../../services/auth.service';
import { RefreshService } from '../../services/refresh.service';
import { RegisterData } from '../../models/register-data.model';
import { ButtonDirective } from "../../components/button/button.directive";
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { isZodValidationError, mapZodErrorsToFieldTree, isConflictError, mapAuthErrorToBanner } from '../../shared/zod-signal-errors';
import { TextFieldComponent } from '../../components/text-field/text-field';

@Component({
  selector: 'app-register',
  imports: [FormField, ButtonDirective, TextFieldComponent, RouterLink],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
    private authService = inject(AuthService);
    private refreshService = inject(RefreshService);
    private router = inject(Router);

    readonly registrationSuccess = signal(false);
    bannerErrors = signal<string[]>([]);

    registerModel = signal<RegisterData>({
        email: '',
        username: '',
        h_password: '',
    });

    registerForm = form(this.registerModel, (fieldPath) => {
        required(fieldPath.email, { message: 'Email is required' });

        required(fieldPath.username, { message: 'Username is required' });

        required(fieldPath.h_password, { message: 'Password is required' });
    });

    onSubmit(event: Event) {
        event.preventDefault();

        submit(this.registerForm, async (field) => {
            const { email, username, h_password } = this.registerModel();
            const body = { username, email, h_password };

            try {
                this.bannerErrors.set([]);
                await firstValueFrom(this.authService.register(body));
            } catch (err) {
                if (isZodValidationError(err)) {
                    console.log('Backend validation error:', err.error);
                    const { fieldErrors, bannerErrors } = mapZodErrorsToFieldTree(err.error, field);
                    this.bannerErrors.set(bannerErrors);
                    return fieldErrors;
                }
                if (isConflictError(err)) {
                    const { bannerErrors } = mapAuthErrorToBanner(err.error);
                    this.bannerErrors.set(bannerErrors);
                    return undefined;
                }
                console.log('Registration failed (FRONTEND)', err);
                return undefined;
            }

            try {
                await firstValueFrom(this.refreshService.login({ identifier: username, password: h_password }));
                await firstValueFrom(this.refreshService.getMe());
                this.router.navigate(['/app']);
            } catch (err) {
                console.log('Auto-login after registration failed (FRONTEND)', err);
                this.registrationSuccess.set(true);
                setTimeout(() => this.router.navigate(['/login']), 2500);
            }
            return undefined;
        });
    }
}
