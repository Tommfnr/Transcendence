import { Component, input, output, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { booleanAttribute, numberAttribute } from '@angular/core';


export type TextFieldTone = 'white' | 'field' | 'complementary';
export type TextFieldType = 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';

@Component({
	selector: 'app-text-field',
	imports: [],
	templateUrl: './text-field.html',
})

export class TextFieldComponent implements FormValueControl<string> {

	readonly value = model('');

	readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
	readonly touched = input(false);
	readonly required = input(false);
	readonly disabled = input(false);
	readonly touch = output<void>();

	readonly tone = input<TextFieldTone>('white');
	readonly placeholder = input.required<string>();
	readonly typeField = input<TextFieldType>('text');
	readonly label = input<string>();

	/* Text-area specific */
	readonly multiline = input(false, { transform: booleanAttribute});
	readonly rows = input(3, { transform: numberAttribute });

	private static count = 0;
	id = `text-field-${TextFieldComponent.count++}`;

	onInput(event: Event) {

		const field = event.target as HTMLInputElement;
		this.value.set(field.value);
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

		return `${base} ${surface[this.tone()]}`;
	}
}
