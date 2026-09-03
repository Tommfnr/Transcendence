import { Component, OnInit, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { GroupFormData } from '../../models/group-data.model';
import { ButtonComponent } from '../../components/button/button';

@Component({
  selector: 'app-editAddGroup',
  imports: [FormField, ButtonComponent, RouterLink],
  templateUrl: './editAddGroup.html',
})
export class EditAddGroup implements OnInit {
  private groupsService = inject(GroupsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private groupId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.groupId;

  groupModel = signal<GroupFormData>({
    name: '',
  });

  readonly errorMessage = signal<string | null>(null);

  groupForm = form(this.groupModel, (fieldPath) => {
    required(fieldPath.name, { message: 'Name is required' });
  });

  ngOnInit(): void {
    if (this.groupId) {
      this.groupsService.findOne(Number(this.groupId)).subscribe((data) => {
        this.groupModel.set({ name: data.name });
      });
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.groupForm, async () => {
      let request;
      if (this.groupId) {
        request = this.groupsService.update(Number(this.groupId), this.groupModel());
      } else {
        request = this.groupsService.create(this.groupModel());
      }

      request.subscribe({
        next: () => {
          this.router.navigate(['/app/groupParameter']);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message);
        },
      });
    });
  }
}
