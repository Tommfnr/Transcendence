import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, defer, finalize, firstValueFrom, shareReplay, tap } from 'rxjs';
import { LoginResponse, RefreshResponse } from '../models/refresh.types';
import { User, UserInput } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class RefreshService {
    private http = inject(HttpClient);

    private accessToken = signal<string | null>(null);

    private currentUser = signal<User | null>(null);
    readonly user = this.currentUser.asReadonly();

    readonly isLoggedIn = computed(() => this.accessToken() !== null);

    login(body: {
        identifier: string;
        password: string;
        rememberMe?: boolean;
    }): Observable<LoginResponse> {
        return this.http.post<LoginResponse>('/api/auth/login', body).pipe(
            tap(({ access_token }) => {
                this.accessToken.set(access_token);
            }),
        );
    }

    getMe(): Observable<User> {
        return this.http.get<User>('/api/users/me').pipe(
            tap((user) => {
                this.currentUser.set(user);
            }),
        );
    }

    updateMe(body: UserInput): Observable<User> {
        return this.http.patch<User>('/api/users/me', body).pipe(
            tap((user) => {
                this.currentUser.set(user);
            }),
        );
    }

    private refreshInFlight$: Observable<RefreshResponse> | null = null;

    // Concurrent 401s (e.g. a page firing several guarded requests at once)
    // must share one /api/auth/refresh call: the backend revokes the old
    // refresh-token row on every call, so a second parallel call using the
    // same not-yet-updated cookie hits reuse detection and kills the whole
    // session instead of just retrying.
    refreshToken(): Observable<RefreshResponse> {
        if (this.refreshInFlight$) {
            return this.refreshInFlight$;
        }

        const request = () =>
            firstValueFrom(this.http.post<RefreshResponse>('/api/auth/refresh', {}));

        this.refreshInFlight$ = defer(() =>
            navigator.locks ? navigator.locks.request('pep-auth-refresh', request) : request(),
        ).pipe(
            tap(({ access_token }) => {
                this.accessToken.set(access_token);
            }),
            finalize(() => {
                this.refreshInFlight$ = null;
            }),
            shareReplay(1),
        );

        return this.refreshInFlight$;
    }

    logout(): Observable<unknown> {
        return this.http.post('/api/auth/logout', {}).pipe(
            tap(() => {
                this.accessToken.set(null);
                this.currentUser.set(null);
            }),
        );
    }

    getAccessToken(): string | null {
        return this.accessToken();
    }

    clearAccessToken(): void {
        this.accessToken.set(null);
        this.currentUser.set(null);
    }
}
