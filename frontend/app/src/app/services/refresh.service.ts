import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, tap } from 'rxjs'
import { LoginResponse, RefreshResponse } from '../models/refresh.types'

@Injectable({ providedIn: 'root' })
export class RefreshService {
	private http = inject(HttpClient)

	login(username: string, password: string): Observable<LoginResponse> {
		return (this.http
		.post<LoginResponse>('/api/auth/login', { username, password })
		.pipe(tap(({ access_token, refresh_token }) => {
			localStorage.setItem('access_token', access_token)
			localStorage.setItem('refresh_token', refresh_token)
		}))
		)
	}

	refreshToken(): Observable<RefreshResponse> {
		const refresh_token = this.getRefreshToken()
		
		return (this.http
			.post<RefreshResponse>('/api/auth/refresh', { refresh_token })
			.pipe(tap(({ access_token }) => {
					localStorage.setItem('access_token', access_token)
			}))
		)
	
	}

	getAccessToken(): string | null {
		return (localStorage.getItem('access_token'))
	}

	getRefreshToken(): string | null {
		return (localStorage.getItem('refresh_token'))
	}

	clearTokens(): void {
		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')
	}
}