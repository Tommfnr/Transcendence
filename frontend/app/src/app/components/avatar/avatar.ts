import { Component, Input } from '@angular/core';

export type AvatarTone = 'neutral' | 'brand';

/**
 * User placeholder shown before a photo loads, and when there is none.
 *
 * `neutral` is other people (request cards); `brand` is the signed-in user
 * (app header). The distinction is deliberate — don't pick by taste.
 */
@Component({
	selector: 'app-avatar',
	standalone: true,
	template: `<span [class]="classes"></span>`,
})
export class AvatarComponent {
	@Input() tone: AvatarTone = 'neutral';

	get classes(): string {
		const base = 'block size-10 shrink-0 rounded-full';
		const tones: Record<AvatarTone, string> = {
			neutral: 'bg-muted/50',
			brand: 'bg-primary/50',
		};
		return `${base} ${tones[this.tone]}`;
	}
}
