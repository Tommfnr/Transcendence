import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, required, email, submit } from '@angular/forms/signals';
import { AuthService } from '../../services/auth.service';

interface registerData {
  email: string;
  username: string;
  h_password: string;
}

@Component({
  selector: 'app-register',
  imports: [FormField],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  registerModel = signal<registerData>({
    email: '',
    username: '',
    h_password: '',
  });

  registerForm = form(this.registerModel, (fieldPath) => {
    required(fieldPath.email, { message: 'Email is required' });
    
    required(fieldPath.username, { message: 'Username is required'});

    required(fieldPath.h_password, { message: 'Password is required' });
  });

  constructor(private authService: AuthService) { }

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.registerForm, async () => {
      const { email, username, h_password } = this.registerModel();

      const body = {
        username,
        email,
        h_password,
      };

      this.authService.register(body)
        .subscribe({
          next: (response) => console.log('Logged in!', response),
          error: (err) => console.log('Invalid credentials (FRONTEND)', err),
        });
    });
  }
}


