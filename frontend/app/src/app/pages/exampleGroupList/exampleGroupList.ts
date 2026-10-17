import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { GroupEntity } from '../../models/group.model';

@Component({
  selector: 'app-exampleGroupList',
  imports: [RouterLink],
  templateUrl: './exampleGroupList.html',
})
export class ExampleGroupList {
  private groupsService = inject(GroupsService);

  readonly groups = signal<GroupEntity[]>([]);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.groupsService.findMy().subscribe({
      next: (data) => this.groups.set(data),
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error will showing group(s)');
      },
    });
  }
}
