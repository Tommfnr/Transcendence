import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { form, FormField, required, email, submit } from '@angular/forms/signals';
import { AuthService } from '../../services/auth.service';
import { RegisterData } from '../../models/register-data.model';
import { ButtonComponent } from "../../components/button/button";
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { isZodValidationError, mapZodErrorsToFieldTree, isConflictError, mapAuthErrorToBanner } from '../../shared/zod-signal-errors';

@Component({
  selector: 'app-register',
  imports: [FormField, ButtonComponent],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private authService = inject(AuthService)
  private router = inject(Router)

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
      const body = {username, email, h_password };

      try {
        this.bannerErrors.set([]);
        await firstValueFrom(this.authService.register(body));
        this.registrationSuccess.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2500);
        return (undefined);
      } 
      catch (err) {
        if (isZodValidationError(err)) {
          console.log('Backend validation error:', err.error);
          const { fieldErrors, bannerErrors } = mapZodErrorsToFieldTree(err.error, field);
          this.bannerErrors.set(bannerErrors);
          return (fieldErrors);
        }
        if (isConflictError(err)) {
          const { bannerErrors } = mapAuthErrorToBanner(err.error);
          this.bannerErrors.set(bannerErrors);
          return (undefined);
        }
        console.log('Registration failed (FRONTEND)', err);
        return (undefined);
      }
    });
  }
}


