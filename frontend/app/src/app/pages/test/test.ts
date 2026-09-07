import { Component, signal } from '@angular/core';
import { ChipComponent } from "../../components/chip/chip";

interface Category {
		label: string;
		emoji: string;
}

@Component({
  selector: 'app-test',
  imports: [ChipComponent],
  templateUrl: './test.html',
  styles: ``,
})



export class Test {
	categories: Category[] = [
		{ label:'DIY', emoji:'🛠️' },
		{ label:'Garden', emoji:'🌱' },
		{ label:'Electronic', emoji:'💻' },
		{ label:'Leisure', emoji:'🎮' },
		{ label:'Other', emoji:'📦' }
	]
	activeCategory = signal('DIY');
}
