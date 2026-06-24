import { ChangeDetectionStrategy, Component, signal} from '@angular/core';
import { form, FormField, submit } from '@angular/forms/signals';
import { HttpClient } from '@angular/common/http';

interface LoginData {
  username: string;
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
    username: '',
    password: '',
    rememberMe: false,
  });
  loginForm = form(this.loginModel);

  constructor(private http: HttpClient) {}

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.loginForm, async () => {
      const credentials = this.loginModel();

      this.http.post('http://localhost:8080/api/auth/login', credentials)
      .subscribe({
        next: (response) => console.log('Logged in!', response),
        error: (err) => console.log('Invalid credentials', err),
        });
     })
  }
}


