import { Component } from '@angular/core';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { ButtonDirective } from '../../components/button/button.directive';

@Component({
    selector: 'app-help-support',
    imports: [ TitleBarComponent, ButtonDirective],
    templateUrl: './helpSupport.html',
    styles: ``,
})
export class HelpSupport {}
