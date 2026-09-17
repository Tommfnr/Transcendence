import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { GroupEntity } from '../../models/group.model';
import { ButtonComponent } from '../../components/button/button';
import { ButtonDirective } from '../../components/button/button.directive';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { GroupCardComponent } from '../../components/group-card/group-card';
import { ModalService } from '../../services/modal.service';
import { Location } from '@angular/common';



@Component({
	selector: 'app-groupParameter',
	imports: [RouterLink, ButtonComponent, ButtonDirective, TitleBarComponent, GroupCardComponent],
	templateUrl: './groupParameter.html',
})

export class GroupParameter implements OnInit {
	private groupsService = inject(GroupsService);
	readonly groupData = signal<GroupEntity[]>([]);
	readonly memberCounts = signal<Record<number, number>>({});
	readonly modalService = inject(ModalService);
	private location = inject(Location);
	private router = inject(Router);

	ngOnInit(): void {
		this.groupsService.findMy().subscribe((data) => {
			this.groupData.set(data);

			for (const group of data) {
				this.groupsService.findMembers(group.id).subscribe((members) => {
					this.memberCounts.update((current) => ({ ...current, [group.id]: members.length }));
				});
			}
		});
	}

	deleteGroup(groupId: number): void {
		this.groupsService.deleteGroup(groupId).subscribe(() => {
			this.groupData.update((groups) => groups.filter((group) => group.id !== groupId));
		});
	}

	openAddGroup(): void {
		this.modalService.openAddGroup();
	}

	goBack(): void {
		if (window.history.length > 1) {
			this.location.back();
		}
		else {
			this.router.navigate(['/app/dashboard']);
		}
	}

}
