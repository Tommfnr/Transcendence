import {
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
    inject,
    provideAppInitializer,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom, catchError, of, switchMap } from 'rxjs';

import { routes } from './app.routes';
import { refreshInterceptor } from './services/refresh.interceptor';
import { RefreshService } from './services/refresh.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([refreshInterceptor])),
        provideAppInitializer(() => {
            // to refresh page on arrival, no login if existing session found
            const refreshService = inject(RefreshService);
            if (!refreshService.hasSessionHint()) {
                return Promise.resolve(null);
            }
            return firstValueFrom(
                refreshService.refreshToken().pipe(
                    switchMap(() => refreshService.getMe()),
                    catchError(() => of(null)),
                ),
            );
        }),
    ],
};
