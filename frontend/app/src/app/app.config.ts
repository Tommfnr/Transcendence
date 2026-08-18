import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

import { routes } from './app.routes';
import { refreshInterceptor } from './services/refresh.interceptor';
import { RefreshService } from './services/refresh.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([refreshInterceptor])),
    provideAppInitializer(() => { // to refresh page on arrival, no login if existing session found
      const refreshService = inject(RefreshService)
      const router = inject(Router)
      return (firstValueFrom(refreshService.refreshToken().pipe(catchError(() => { router.navigate(['/login']);  return of(null) }))))
    })
  ]
};
