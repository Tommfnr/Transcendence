import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { form, FormField, required, email, submit } from '@angular/forms/signals';
import { LoginData } from '../../models/login-data.model';
import { Router } from '@angular/router'
import { RefreshService } from '../../services/refresh.service';


@Component({
  selector: 'app-login',
  imports: [FormField],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private refreshService = inject(RefreshService)
  private router = inject(Router)

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

      submit(this.loginForm, async () => {
        const { identifier, password, rememberMe } = this.loginModel()

        this.refreshService.login(identifier, password, rememberMe)
          .subscribe({
            next: () => this.router.navigate(['/']),
            error: (err) => console.log('Invalid creds (FRONTEND)', err)
          })
      })
    });
  }
}


