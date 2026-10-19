import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { ButtonDirective } from '../../components/button/button.directive';

@Component({
	selector: 'app-notFound',
	imports: [TitleBarComponent, ButtonDirective, RouterLink],
	templateUrl: './notFound.html',
})
export class NotFound { }
