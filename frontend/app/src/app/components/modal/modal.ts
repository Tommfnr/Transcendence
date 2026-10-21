import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  host: {
	'(document:keydown.escape)': 'onClose()',
  },
})
export class Modal {
  title = input.required<string>();
  subtitle = input<string>('');
  closed = output<void>();

  onClose(): void {
    this.closed.emit();
  }
}