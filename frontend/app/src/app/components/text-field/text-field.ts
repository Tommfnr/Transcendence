import { Component, Input } from '@angular/core';

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
	@Input() type: TextFieldType = 'text';

	get classes(): string {
		const base =
			'rounded-card border border-text-secondary px-4 py-2 text-sm font-medium '
			+
			'outline-none focus:border-primary';

		const surface: Record<TextFieldTone, string> = {
			white: 'bg-card',
			field: 'bg-field-surface',
			complementary: 'bg-complementary',
		};
		return `${base} ${surface[this.tone]}`;
	}
}
