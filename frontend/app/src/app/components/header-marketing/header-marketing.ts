import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RefreshService } from '../../services/refresh.service';
import { Router } from '@angular/router';
import { ButtonDirective } from '../button/button.directive';

@Component({
	selector: 'app-header-marketing',
	imports: [RouterLink, ButtonDirective],
	templateUrl: './header-marketing.html',
})

export class HeaderMarketing {
	private readonly refreshService = inject(RefreshService);
	private readonly router = inject(Router);

	readonly isLoggedIn = this.refreshService.isLoggedIn;

	onLogout() {
		this.refreshService.logout().subscribe( {
			next: () => this.router.navigate(['/']),
			error: () => {
				this.refreshService.clearAccessToken();
				this.router.navigate(['/']);
			}
		});
	}
}