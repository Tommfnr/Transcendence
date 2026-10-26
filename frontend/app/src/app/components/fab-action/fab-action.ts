import { Component, EventEmitter, Input, Output } from '@angular/core';

export type FabActionTone = 'object' | 'request' | 'group';

/**
 * One entry of the floating action menu. The label sits left of the icon
 * so it reads back toward the FAB it expands from.
 *
 * The label is plain text, not the accent colour: orange and green labels
 * only reach 2.1:1 on white. The hue lives in the icon circle, which
 * carries no text and so has no contrast requirement. The circles use the
 * -solid surface tokens because these entries float over the menu's dark
 * backdrop — the transparent tints would let it bleed through.
 */
@Component({
	selector: 'app-fab-action',
	standalone: true,
	templateUrl: './fab-action.html',
})

export class FabActionComponent {
	@Input({ required: true }) label!: string;
	@Input({ required: true }) tone!: FabActionTone;
	@Output() pick = new EventEmitter<void>();

	private static readonly ICONS: Record<FabActionTone, string> = {
		object: '/icons/box-orange.svg',
		request: '/icons/hand-give-helps.svg',
		group: '/icons/group-green.svg',
	};

	get icon(): string {
		return FabActionComponent.ICONS[this.tone];
	}

	get circleClasses(): string {
		const base = 'flex size-11 shrink-0 items-center justify-center rounded-full shadow-card';
		const tones: Record<FabActionTone, string> = {
			object: 'bg-primary-surface-solid',
			request: 'bg-complementary-surface-solid',
			group: 'bg-success-surface-solid',
		};
		return `${base} ${tones[this.tone]}`;
	}
}
