import { Component, Input, Output, EventEmitter } from '@angular/core';

export type TitleBarLeading = 'avatar' | 'back' | 'none';

@Component({
	selector: 'app-title-bar',
	imports: [],
	templateUrl: './title-bar.html',
})


export class TitleBar {
	@Input({ required: true }) title!: string;
	@Input() meta: string | null = null;
	@Input({ required: true }) leading!: TitleBarLeading;
	@Output() backClick = new EventEmitter<void>();

}
