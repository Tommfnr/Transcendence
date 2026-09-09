import { Component, signal } from '@angular/core';
import { ChipComponent } from "../../components/chip/chip";
import { TextFieldComponent } from "../../components/text-field/text-field";

interface Category {
		label: string;
		emoji: string;
}

@Component({
  selector: 'app-test',
  imports: [ChipComponent, TextFieldComponent],
  templateUrl: './test.html',
  styles: ``,
})



export class Test {

	username = '';

	categories: Category[] = [
		{ label:'DIY', emoji:'🛠️' },
		{ label:'Garden', emoji:'🌱' },
		{ label:'Electronic', emoji:'💻' },
		{ label:'Leisure', emoji:'🎮' },
		{ label:'Other', emoji:'📦' }
	]
	activeCategory = signal('DIY');
}
