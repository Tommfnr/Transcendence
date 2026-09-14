import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RefreshService } from '../../services/refresh.service';
import { TitleBarComponent } from '../../components/title-bar/title-bar';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, TitleBarComponent],
  templateUrl: './profile.html',
})
export class Profile {
  private refreshService = inject(RefreshService)
  user = this.refreshService.user
}
