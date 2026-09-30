import { Component, Input } from '@angular/core';

export type AvatarTone = 'neutral' | 'brand';
export type AvatarSize = 'md' | 'lg';

/**
 * User placeholder shown before a photo loads, and when there is none.
 *
 * `neutral` is other people (request cards); `brand` is the signed-in user
 * (app header). The distinction is deliberate — don't pick by taste.
 */
@Component({
	selector: 'app-avatar',
	standalone: true,
	template: `<img src="/icons/app-avatar.svg" [class]="classes">`,
})

export class AvatarComponent {
	@Input() tone: AvatarTone = 'neutral';
	@Input() size: AvatarSize = 'md';

	get classes(): string {
		const base = 'block shrink-0 rounded-full';
		const sizes: Record<AvatarSize, string> = {
			md: 'size-10',
			lg: 'size-12',
		};
		const tones: Record<AvatarTone, string> = {
			neutral: 'bg-muted/50',
			brand: 'bg-primary/50',
		};
		return `${base} ${sizes[this.size]} ${tones[this.tone]}`;
	}
}
