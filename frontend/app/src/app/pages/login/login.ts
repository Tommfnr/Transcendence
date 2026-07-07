import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, required, email, submit } from '@angular/forms/signals';
import { AuthService } from '../../services/auth.service';

interface LoginData {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-login',
  imports: [FormField],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
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

  constructor(private authService: AuthService) { }

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.loginForm, async () => {
      const { identifier, password, rememberMe } = this.loginModel();

      const isEmail = identifier.includes('@');

      const body = {
        ...(isEmail ? {email: identifier } : { username: identifier }),
        password,
        rememberMe
      };

      this.authService.login(body)
        .subscribe({
          next: (response) => console.log('Logged in!', response),
          error: (err) => console.log('Invalid credentials (FRONTEND)', err),
        });
    });
  }
}


