import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { GroupsService } from '../../services/groups.service';
import { UsersService } from '../../services/users.service';
import { GroupForm } from '../../models/group-data.model';
import { ButtonComponent } from '../../components/button/button';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-editAddGroup',
  imports: [FormField, ButtonComponent, Modal],
  templateUrl: './editAddGroup.html',
})
export class EditAddGroup implements OnInit {
  private groupsService = inject(GroupsService);
  private usersService = inject(UsersService);
  private modalService = inject(ModalService);

  private groupId = this.modalService.editGroupId();
  readonly isEditMode = computed(() => this.modalService.editGroupId() !== null);

  groupModel = signal<GroupForm>({
    name: '',
    description: '',
  });

  readonly errorMessage = signal<string | null>(null);

  groupForm = form(this.groupModel, (fieldPath) => {
    required(fieldPath.name, { message: 'Name is required' });
  });

  ngOnInit(): void {
    if (this.groupId) {
      this.groupsService.findOne(Number(this.groupId)).subscribe((data) => {
        this.groupModel.set({ name: data.name, description: data.description ?? '' });
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
      if (this.groupId) {
        request = this.groupsService.update(Number(this.groupId), this.groupModel());
      } else {
        request = this.groupsService.create(this.groupModel());
      }

      request.subscribe({
        next: () => {
          this.modalService.close();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message);
        },
      });
    });
  }
  onCancel(): void {
  this.modalService.close();
  }
}
