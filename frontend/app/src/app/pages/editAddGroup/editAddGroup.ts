import { Component, OnInit, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { UsersService } from '../../services/users.service';
import { GroupInput } from '../../models/group.model';
import { ButtonComponent } from '../../components/button/button';

@Component({
  selector: 'app-editAddGroup',
  imports: [FormField, ButtonComponent, RouterLink],
  templateUrl: './editAddGroup.html',
})
export class EditAddGroup implements OnInit {
  private groupsService = inject(GroupsService);
  private usersService = inject(UsersService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private groupId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.groupId;

  group = signal<GroupInput>({
    name: '',
    description: '',
  });

  readonly errorMessage = signal<string | null>(null);

  groupForm = form(this.group, (fieldPath) => {
    required(fieldPath.name, { message: 'Name is required' });
  });

  ngOnInit(): void {
    if (this.isEditMode) {
      this.groupsService.findOne(Number(this.groupId)).subscribe((data) => {
        this.group.set({ name: data.name, description: data.description ?? '' });
      });
    }
  }

  onAddMember(username: string): void {
    this.usersService.findByUsername(username).subscribe({
      next: (user) => {
        this.groupsService.addMember(Number(this.groupId), user.id).subscribe();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message);
      },
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.groupForm, async () => {
      let request;
      if (this.isEditMode) {
        request = this.groupsService.update(Number(this.groupId), this.group());
      } else {
        request = this.groupsService.create(this.group());
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
