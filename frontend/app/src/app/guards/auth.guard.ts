import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { RefreshService } from '../services/refresh.service'

// The app initializer already tried to restore the session before the router starts,
// so reading the in-memory access token here is enough : no need to refresh again
export const authGuard: CanActivateFn = () => {
	const refreshService = inject(RefreshService)
	const router = inject(Router)

	if (refreshService.isLoggedIn()) {
		return (true)
	}

	return (router.createUrlTree(['/login']))
}
