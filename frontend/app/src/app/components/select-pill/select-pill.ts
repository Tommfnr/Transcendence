import { Component, ElementRef, signal, input, inject } from '@angular/core';

export type SelectPillTone = 'accent' | 'neutral';
@Component({
    selector: 'app-select-pill',
    imports: [],
	host: {
		'(document:click)': 'onDocumentClick($event)',
		'(keydown.escape)': 'close()',
	},
    templateUrl: './select-pill.html',
})

export class SelectPillComponent {

	private el = inject(ElementRef);
	tone = input<SelectPillTone>('neutral')
	readonly open = signal(false);
	readonly label = input.required<string>();

	onDocumentClick(event: Event)
	{
		if (this.open() && !this.el.nativeElement.contains(event.target)){
			this.close();
		}
	}

	toggle(): void {
		this.open.set(!this.open());
	}

	close(): void {
		this.open.set(false);
	}

	get classes() : string {
		const base = 'inline-flex items-center rounded-full border pl-4 pr-3 py-2 cursor-pointer text-sm ';

		const tones: Record<SelectPillTone, string> = {
			accent: "bg-complementary-surface text-complementary",
			neutral: "bg-card text-text border-text-secondary",
		}

		return `${base} ${tones[this.tone()]}`;
	}
}
