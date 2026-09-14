import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-header-app',
  imports: [RouterLink],
  templateUrl: './header-app.html',
})
export class HeaderApp {
  private refreshService = inject(RefreshService)
  readonly userName = computed(() => this.refreshService.user()?.username ?? 'User');
}
