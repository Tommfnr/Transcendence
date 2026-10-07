import { Component, signal, inject, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { AvatarComponent } from '../avatar/avatar';

@Component({
    selector: 'app-header-app-desktop',
    imports: [RouterLink, AvatarComponent],
    templateUrl: './header-app-desktop.html',
	host: {
		'(document:click)': 'onDocumentClick($event)',
		'(keydown.escape)': 'close()',
	},
})

export class HeaderAppDesktopComponent {
	
	private el = inject(ElementRef);

	onDocumentClick(event: Event): void {
		if (this.open() && !this.el.nativeElement.contains(event.target)) {
			this.close();
		}
	}
	
	readonly open = signal(false);
	readonly modalService = inject(ModalService);

	toggle(): void {
		this.open.update((o) => !o);
	}

	close(): void {
		this.open.set(false);
	}
}
