import { Component, Input } from '@angular/core';

export type AvatarKind = 'person' | 'group' | 'mySelf';
export type AvatarSize = 'md' | 'lg' | 'xl';

/**
 * Placeholder avatar shown before a photo loads, and when there is none.
 *
 * The artwork (circle + silhouette) is baked into the SVG files:
 * `person` for any other user, `group` for any group, and `mySelf`
 * (inverted colours) for the signed-in user — don't pick by taste.
 */
@Component({
	selector: 'app-avatar',
	standalone: true,
	template: `<img [src]="icon" alt="" [class]="classes">`,
})

export class AvatarComponent {
	@Input() size: AvatarSize = 'md';
	@Input() kind: AvatarKind = 'person';

	get icon(): string {
		const icons: Record<AvatarKind, string> = {
			person: '/icons/avatar-person.svg',
			group: '/icons/avatar-group.svg',
			mySelf: '/icons/avatar-myself.svg',
		};
		return icons[this.kind];
	}

	get classes(): string {
		const base = 'block shrink-0 rounded-full';
		const sizes: Record<AvatarSize, string> = {
			md: 'size-10',
			lg: 'size-12',
			xl: 'size-16'
		};
		return `${base} ${sizes[this.size]}`;
	}
}
