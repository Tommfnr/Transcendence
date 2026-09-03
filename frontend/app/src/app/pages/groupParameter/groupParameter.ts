import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { GroupData } from '../../models/group-data.model';
import { ButtonComponent } from '../../components/button/button';
import { ButtonDirective } from '../../components/button/button.directive';

@Component({
  selector: 'app-groupParameter',
  imports: [RouterLink, ButtonComponent, ButtonDirective],
  templateUrl: './groupParameter.html',
})

export class GroupParameter implements OnInit {
  private groupsService = inject(GroupsService);
  readonly groupData = signal<GroupData[]>([]);

  ngOnInit(): void {
    this.groupsService.findMy().subscribe((data) => { this.groupData.set(data); });
  }

  deleteGroup(id: number): void {
    this.groupsService.deleteGroup(id).subscribe(() => {
      this.groupData.update((groups) => groups.filter((group) => group.id !== id));
    });
  }
}
