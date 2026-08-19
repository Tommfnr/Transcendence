import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-header-marketing',
  imports: [RouterLink],
  templateUrl: './header-marketing.html',
})
export class HeaderMarketing {
  private readonly refreshService = inject(RefreshService);

  readonly isLoggedIn = this.refreshService.isLoggedIn;
}
