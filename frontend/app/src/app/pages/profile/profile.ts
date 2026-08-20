import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.html',
})
export class Profile {
  private refreshService = inject(RefreshService)
  user = this.refreshService.user
}
