import { Component, input, output } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar';
import { ButtonComponent } from '../button/button';

@Component({
    selector: 'app-group-card',
    imports: [AvatarComponent],
    templateUrl: './group-card.html',
})

export class GroupCardComponent {
	readonly name = input.required<string>();
	readonly memberCount = input.required<number>();
	readonly role = input.required<string>();
	readonly settings = output<void>();

}
