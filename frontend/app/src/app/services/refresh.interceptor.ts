import { inject } from '@angular/core'
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http'
import { catchError, switchMap, throwError } from 'rxjs'
import { Router } from '@angular/router'
import { RefreshService } from './refresh.service'

export const refreshInterceptor: HttpInterceptorFn = (
	req: HttpRequest<unknown>,
	next: HttpHandlerFn
) => {
	const refreshService = inject(RefreshService)
	const router = inject(Router)
	const token = refreshService.getAccessToken()

	const authReq = token ? req.clone({
		setHeaders: {
			Authorization: `Bearer ${token}`,
		},
	})
	: req

	return (next(authReq).pipe(
		catchError((err: HttpErrorResponse) => {
			if (err.status == 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
				return (refreshService.refreshToken().pipe(
					switchMap(({ access_token }) => {
						const retryreq = req.clone({
							setHeaders: {
								Authorization: `Bearer ${access_token}`,
							},
						})
						return (next(retryreq))
					}),
					catchError((refreshErr) => {
						refreshService.clearTokens()
						router.navigate(['/login'])
						return (throwError(() => refreshErr))
					})
				))
			}

			return (throwError(() => err))
		})
	))
}