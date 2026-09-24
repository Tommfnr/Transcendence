import { Component } from '@angular/core';
import { ButtonDirective } from '../../components/button/button.directive';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [ButtonDirective, RouterLink],
  templateUrl: './landing.html',
})
export class Landing {}
