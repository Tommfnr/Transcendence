import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, tap } from 'rxjs'
import { LoginResponse, RefreshResponse } from '../models/refresh.types'

@Injectable({ providedIn: 'root' })
export class RefreshService {
	private http = inject(HttpClient)

	private accessToken: string | null = null

	login(username: string, password: string, rememberMe?: boolean ): Observable<LoginResponse> {
		return (this.http
		.post<LoginResponse>('/api/auth/login', { username, password, rememberMe })
		.pipe(tap(({ access_token }) => {
			this.accessToken = access_token
		}))
		)
	}

	refreshToken(): Observable<RefreshResponse> {		
		return (this.http
			.post<RefreshResponse>('/api/auth/refresh', {})
			.pipe(tap(({ access_token }) => {
				this.accessToken = access_token
			}))
		)
	}

	logout(): Observable<unknown> {
		return (this.http
			.post('/api/auth/logout', {})
			.pipe(tap(() => {
				this.accessToken = null
			}))
		)
	}

	getAccessToken(): string | null {
		return (this.accessToken)
	}

	clearAccessToken(): void {
		this.accessToken = null
	}
}