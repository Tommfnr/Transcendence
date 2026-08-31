import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HelpRequest } from '../../models/help-request.model';
import { ButtonDirective } from '../button/button.directive';
import { AvatarComponent } from '../avatar/avatar';
import { TagComponent } from '../tag/tag';
import { StatusBadgeComponent } from '../status-badge/status-badge';

@Component({
  selector: 'app-request-card',
  imports: [RouterLink, ButtonDirective, AvatarComponent, TagComponent, StatusBadgeComponent],
  templateUrl: './request-card.html',
})
export class RequestCard {
  readonly request = input.required<HelpRequest>();
  readonly help = output<HelpRequest>();

  /** A request with no status is open, and therefore actionable. */
  readonly isOpen = () => (this.request().status ?? 'open') === 'open';

  /** Narrowed for the badge: only reached when the request is not open. */
  readonly closedStatus = (): 'pending' | 'done' => {
    const status = this.request().status;
    return status === 'done' ? 'done' : 'pending';
  };
}
