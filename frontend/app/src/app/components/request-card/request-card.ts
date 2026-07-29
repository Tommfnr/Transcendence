import { Component, input, output } from '@angular/core';
import { HelpRequest } from '../../models/help-request.model';

@Component({
  selector: 'app-request-card',
  imports: [],
  templateUrl: './request-card.html',
})
export class RequestCard {
  readonly request = input.required<HelpRequest>();
  readonly help = output<HelpRequest>();
}
