import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-app',
  imports: [RouterLink],
  templateUrl: './header-app.html',
})
export class HeaderApp {
  readonly userName = input('Steve');
}
