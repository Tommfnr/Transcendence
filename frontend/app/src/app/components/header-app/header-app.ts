import { Component, input } from '@angular/core';

@Component({
  selector: 'app-header-app',
  imports: [],
  templateUrl: './header-app.html',
  styleUrl: './header-app.css',
})
export class HeaderApp {
  readonly userName = input('Steve');
}
