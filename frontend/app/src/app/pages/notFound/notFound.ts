import { Component } from '@angular/core';
import { ButtonDirective } from '../../components/button/button.directive';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-not-found',
    imports: [ ButtonDirective, RouterLink ],
    templateUrl: './notFound.html',
})

export class NotFound {}
