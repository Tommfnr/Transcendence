import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { form, FormField, required, email, submit } from '@angular/forms/signals';
import { LoginData } from '../../models/login-data.model';
import { Router, RouterLink } from '@angular/router'
import { RefreshService } from '../../services/refresh.service';
import { ButtonDirective } from '../../components/button/button.directive';
import { firstValueFrom } from 'rxjs';
import { isAuthError, isZodValidationError, mapAuthErrorToBanner, mapZodErrorsToFieldTree } from '../../shared/zod-signal-errors';
import { TextFieldComponent } from '../../components/text-field/text-field';

@Component({
  selector: 'app-login',
  imports: [FormField, ButtonDirective, TextFieldComponent, RouterLink],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class Login {
  private refreshService = inject(RefreshService)
  private router = inject(Router)

  bannerErrors = signal<string[]>([]);

  loginModel = signal<LoginData>({
    identifier: '',
    password: '',
    rememberMe: false,
  });

  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.identifier, { message: 'Username or email is required' });

    const currentIdentifier = this.loginModel().identifier;
    if (currentIdentifier.includes('@')) {
      email(fieldPath.identifier, { message: 'Enter a valid email address' });
    }

    required(fieldPath.password, { message: 'Password is required' });
  });

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.loginForm, async (field) => {
      const { identifier, password, rememberMe } = this.loginModel();
      const body = {identifier, password, rememberMe };

      try {
        this.bannerErrors.set([]);
        await firstValueFrom(this.refreshService.login(body));
        await firstValueFrom(this.refreshService.getMe());
        this.router.navigate(['/app']);
        return (undefined);
      }
      catch (err) {
        if (isZodValidationError(err)) {
          //console.log('Backend validation error:', err.error);
          const { fieldErrors, bannerErrors } = mapZodErrorsToFieldTree(err.error, field);
          this.bannerErrors.set(bannerErrors);
          return (fieldErrors);
        }
        if (isAuthError(err)) {
          const { fieldErrors, bannerErrors } = mapAuthErrorToBanner(err.error);
          this.bannerErrors.set(bannerErrors);
          return (fieldErrors);
        }
        console.log('Invalid creds (FRONTEND)', err);
        this.bannerErrors.set(['Something went wrong, please try again']);
        return (undefined);
      }
    })
  };
}


