import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ObjectService } from '../../services/object.service';
import { GroupsService } from '../../services/groups.service';
import { CreateObjectData } from '../../models/object-data.model';
import { Group } from '../../models/groups.model';
import { ButtonComponent } from '../../components/button/button';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-editAddObject',
  imports: [FormField, ButtonComponent, Modal],
  templateUrl: './editAddObject.html',
})
export class EditAddObject implements OnInit {
  private objectService = inject(ObjectService);
  private groupsService = inject(GroupsService);
  private modalService = inject(ModalService);

  readonly isEditMode = computed(() => this.modalService.editObjectId() !== null);

  readonly myGroups = signal<Group[]>([]);
  readonly selectedGroupIds = signal<number[]>([]);

  objectModel = signal<CreateObjectData>({
    name: '',
    type: '',
    description: '',
    condition: 'new',
    isAvailable: true,
  });

  objectForm = form(this.objectModel, (fieldPath) => {
    required(fieldPath.name, { message: 'Name is required' });
    required(fieldPath.type, { message: 'Type is required' });
  });

  ngOnInit(): void {
    const objectId = this.modalService.editObjectId();
    if (objectId) {
      this.objectService.findOne(Number(objectId)).subscribe((data) => {
        this.objectModel.set({
          name: data.name,
          type: data.type,
          description: data.description ?? '',
          condition: data.condition,
          isAvailable: data.isAvailable,
        });
      });
    } else {
      this.groupsService.findMy().subscribe((groups) => {
        this.myGroups.set(groups);
      });
    }
  }

  onGroupToggle(event: Event, groupId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    const ids = this.selectedGroupIds();

    if (checked) {
      this.selectedGroupIds.set([...ids, groupId]);
    } else {
      this.selectedGroupIds.set(ids.filter((id) => id !== groupId));
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.objectForm, async () => {
      const objectId = this.modalService.editObjectId();
      let request;
      if (objectId) {
        request = this.objectService.update(Number(objectId), this.objectModel());
      } else {
        request = this.objectService.create(this.objectModel());
      }

      request.subscribe((response) => {
        if (response.length === 0) {
          return;
        }

        if (!objectId) {
          const newObjectId = response[0].id;
          for (const groupId of this.selectedGroupIds()) {
            this.groupsService.grantObject(groupId, newObjectId).subscribe();
          }
        }

        this.modalService.close();
      });
    });
  }

  onCancel(): void {
    this.modalService.close();
  }
}
