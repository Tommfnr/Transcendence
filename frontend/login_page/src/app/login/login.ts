import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, required, email, submit } from '@angular/forms/signals';
import { HttpClient } from '@angular/common/http';

interface LoginData {
  email: string;
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
    email: '',
    password: '',
    rememberMe: false,
  });

  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.email, { message: 'Email is required' });
    email(fieldPath.email, { message: 'Enter a valid email address' });
    required(fieldPath.password, { message: 'Password is required' });
  });

  constructor(private http: HttpClient) { }

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.loginForm, async () => {
      const credentials = this.loginModel();

      this.http.post('http://localhost:8080/api/auth/login', credentials)
        .subscribe({
          next: (response) => console.log('Logged in!', response),
          error: (err) => console.log('Invalid credentials', err),
        });
    });
  }
}


