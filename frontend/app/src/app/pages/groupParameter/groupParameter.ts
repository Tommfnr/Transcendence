import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { GroupEntity } from '../../models/group.model';
import { ButtonComponent } from '../../components/button/button';
import { ButtonDirective } from '../../components/button/button.directive';

@Component({
  selector: 'app-groupParameter',
  imports: [RouterLink, ButtonComponent, ButtonDirective],
  templateUrl: './groupParameter.html',
})

export class GroupParameter implements OnInit {
  private groupsService = inject(GroupsService);
  readonly groupData = signal<GroupEntity[]>([]);
  readonly memberCounts = signal<Record<number, number>>({});

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
}
