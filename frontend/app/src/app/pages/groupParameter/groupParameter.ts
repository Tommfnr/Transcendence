import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { GroupEntity } from '../../models/group.model';
import { ButtonDirective } from '../../components/button/button.directive';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { GroupCardComponent } from '../../components/group-card/group-card';
import { ModalService } from '../../services/modal.service';
import { RefreshService } from '../../services/refresh.service';
import { Location } from '@angular/common';
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';



@Component({
	selector: 'app-groupParameter',
	imports: [ ButtonDirective, TitleBarComponent, GroupCardComponent, ErrorBannerComponent],
	templateUrl: './groupParameter.html',
})

export class GroupParameter implements OnInit {
	private groupsService = inject(GroupsService);
	readonly groupData = signal<GroupEntity[]>([]);
	readonly memberCounts = signal<Record<number, number>>({});
	readonly bannerErrors = signal<string[]>([]);
	readonly loadFailed = signal(false);
	readonly modalService = inject(ModalService);
	private location = inject(Location);
	private router = inject(Router);
	private refreshService = inject(RefreshService);

	private previousModal = this.modalService.activeModal();

	constructor() {
		// Reload once the add/edit group modal closes: a group may have been
		// created, renamed, deleted or left, or its members changed.
		effect(() => {
			const modal = this.modalService.activeModal();

			if (this.previousModal === 'addGroup' && modal === null)
				this.loadGroups();
			this.previousModal = modal;
		});
	}

	ngOnInit(): void {
		this.loadGroups();
	}

	private loadGroups(): void {
		this.bannerErrors.set([]);
		this.loadFailed.set(false);
		this.groupsService.findMy().subscribe({
			next: (data) => {
				this.groupData.set(data);

				for (const group of data) {
					this.groupsService.findMembers(group.id).subscribe({
						next: (members) => this.memberCounts.update((current) => ({ ...current, [group.id]: members.length })),
						error: () => this.showError('Could not load the member count of some groups'),
					});
				}
			},
			error: () => {
				this.loadFailed.set(true);
				this.showError('Could not load your groups');
			},
		});
	}

	private showError(message: string): void {
		this.bannerErrors.update((errors) => errors.includes(message) ? errors : [...errors, message]);
	}

	roleLabel(group: GroupEntity): string {
		if (group.ownerId === this.refreshService.user()?.id)
			return ('Owner');
		return (group.role === 'admin' ? 'Admin' : 'Member');
	}

	deleteGroup(groupId: number): void {
		this.groupsService.deleteGroup(groupId).subscribe({
			next: () => this.groupData.update((groups) => groups.filter((group) => group.id !== groupId)),
			error: () => this.showError('Could not delete the group'),
		});
	}

	openAddGroup(): void {
		this.modalService.openAddGroup();
	}

}
