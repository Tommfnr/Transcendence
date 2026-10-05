import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RefreshService } from '../../services/refresh.service';
import { AvatarComponent } from '../avatar/avatar';

@Component({
  selector: 'app-header-app',
  imports: [RouterLink, AvatarComponent],
  templateUrl: './header-app.html',
})
export class HeaderAppComponent {
  private refreshService = inject(RefreshService)
  readonly userName = computed(() => this.refreshService.user()?.username ?? 'User');
}
