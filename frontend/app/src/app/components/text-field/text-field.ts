import { Component, Input, Output, EventEmitter } from '@angular/core';

export type TextFieldTone = 'white' | 'field' | 'complementary';
export type TextFieldType = 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';

@Component({
  selector: 'app-text-field',
  imports: [],
  templateUrl: './text-field.html',
})

export class TextFieldComponent {
	
	@Input() tone: TextFieldTone = 'white';
	@Input({ required: true }) placeholder!: string;
	@Input() typeField: TextFieldType = 'text';
	@Input() label?: string;
	@Output() valueChange = new EventEmitter<string>();

	private static count = 0;
	id = `text-field-${TextFieldComponent.count++}`;

	onInput(event: Event) {
	
		const field = event.target as HTMLInputElement;
		this.valueChange.emit(field.value);
	}
	
	get classes(): string {
		const base =
			'rounded-card border border-text-secondary px-4 py-2 text-sm font-medium placeholder:text-text-secondary '
			+
			'focus:outline-none focus:ring-1 focus:ring-offset-background ';

		const surface: Record<TextFieldTone, string> = {
			white: 'bg-card focus:border-primary focus:ring-primary text-strong ',
			field: 'bg-field-surface focus:border-primary focus:ring-primary text-strong',
			complementary: 'bg-complementary-surface focus:border-complementary focus:ring-complementary text-strong',
		};

		return `${base} ${surface[this.tone]}`;
	}
}
