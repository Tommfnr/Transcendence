import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, shareReplay, tap } from 'rxjs';
import { LoginResponse, RefreshResponse } from '../models/refresh.types';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class RefreshService {
	private http = inject(HttpClient)

	private accessToken = signal<string | null>(null)

	private currentUser = signal<User | null>(null)
	readonly user = this.currentUser.asReadonly()

	readonly isLoggedIn = computed(() => this.accessToken() !== null)

	login(body: {identifier: string, password: string, rememberMe?: boolean}): Observable<LoginResponse> {
		return (this.http
			.post<LoginResponse>('/api/auth/login', body)
			.pipe(tap(({ access_token }) => {
				this.accessToken.set(access_token)
			}))
		)
	}

	getMe(): Observable<User> {
		return (this.http
			.get<User>('/api/users/me')
			.pipe(tap((user) => {
				this.currentUser.set(user)
			}))
		)
	}

	refreshToken(): Observable<RefreshResponse> {
		return (this.http
			.post<RefreshResponse>('/api/auth/refresh', {})
			.pipe(tap(({ access_token }) => {
				this.accessToken.set(access_token)
			}))
		)
	}

	logout(): Observable<unknown> {
		return (this.http
			.post('/api/auth/logout', {})
			.pipe(tap(() => {
				this.accessToken.set(null)
				this.currentUser.set(null)
			}))
		)
	}

	getAccessToken(): string | null {
		return (this.accessToken())
	}

	clearAccessToken(): void {
		this.accessToken.set(null)
		this.currentUser.set(null)
	}
}
