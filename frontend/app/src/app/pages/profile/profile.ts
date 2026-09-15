import { Component, inject } from '@angular/core';
import { RefreshService } from '../../services/refresh.service';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { ListRowComponent } from '../../components/list-row/list-row';
import { ButtonDirective } from '../../components/button/button.directive';

@Component({
  selector: 'app-profile',
  imports: [ TitleBarComponent, ListRowComponent, ButtonDirective],
  templateUrl: './profile.html',
})
export class Profile {
  private refreshService = inject(RefreshService);
  user = this.refreshService.user;

}
