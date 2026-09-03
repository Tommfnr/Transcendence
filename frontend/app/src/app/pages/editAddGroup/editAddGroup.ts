import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { GroupFormData } from '../../models/group-data.model';

@Component({
  selector: 'app-editAddGroup',
  imports: [RouterLink],
  templateUrl: './editAddGroup.html',
})
export class EditAddGroup implements OnInit {
  private groupsService = inject(GroupsService);
  private route = inject(ActivatedRoute);

  private groupId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.groupId;

  groupModel = signal<GroupFormData>({
    name: '',
  });

  ngOnInit(): void {
    if (this.groupId) {
      this.groupsService.findOne(Number(this.groupId)).subscribe((data) => {
        this.groupModel.set({ name: data.name });
      });
    }
  }
}
