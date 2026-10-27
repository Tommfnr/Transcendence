import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private http = inject(HttpClient);

	login(body: { email?: string; username?: string; password: string }) {
		return this.http.post<{ access_token: string }>('/api/auth/login', body).pipe(
			tap((response) => { localStorage.setItem('token', response.access_token) })
		);
	}
	
	register(body: { email: string; username: string; h_password: string }) {
		return this.http.post('/api/auth/register', body);
	}

/* 	getToken(): string | null {
		return localStorage.getItem('token');
	}

	isLoggedIn(): boolean {
		return !!this.getToken();
	}

	logout(): void {
		localStorage.removeItem('token');
	} */
}