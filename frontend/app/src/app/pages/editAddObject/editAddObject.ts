import { Component, OnInit, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ObjectService } from '../../services/object.service';
import { GroupsService } from '../../services/groups.service';
import { ObjectInput, OBJECT_TYPES } from '../../models/object.model';
import { GroupEntity } from '../../models/group.model';
import { ButtonComponent } from '../../components/button/button';

@Component({
  selector: 'app-editAddObject',
  imports: [FormField, ButtonComponent, RouterLink],
  templateUrl: './editAddObject.html',
})
export class EditAddObject implements OnInit {
  private objectService = inject(ObjectService);
  private groupsService = inject(GroupsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private objectId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.objectId;

  readonly myGroups = signal<GroupEntity[]>([]);
  readonly selectedGroupIds = signal<number[]>([]);
  readonly objectTypes = OBJECT_TYPES;

  object = signal<ObjectInput>({
    name: '',
    type: OBJECT_TYPES[0],
    description: '',
    condition: 'new',
    isAvailable: true,
  });

  objectForm = form(this.object, (fieldPath) => {
    required(fieldPath.name, { message: 'Name is required' });
    required(fieldPath.type, { message: 'Type is required' });
  });

  ngOnInit(): void {
    if (this.isEditMode) {
      this.objectService.findOne(Number(this.objectId)).subscribe((data) => {
        this.object.set({
          name: data.name,
          type: data.type,
          description: data.description ?? '',
          condition: data.condition,
          isAvailable: data.isAvailable,
        });
      });
    }
    else {
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
    }
    else {
      this.selectedGroupIds.set(ids.filter((id) => id !== groupId));
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.objectForm, async () => {
      let request;
      if (this.isEditMode) {
        request = this.objectService.update(Number(this.objectId), this.object());
      }
      else {
        request = this.objectService.create(this.object());
      }

      request.subscribe((response) => {
        if (response.length === 0) {
          return;
        }

        if (!this.isEditMode) {
          const newObjectId = response[0].id;
          for (const groupId of this.selectedGroupIds()) {
            this.groupsService.grantObject(groupId, newObjectId).subscribe();
          }
        }

        this.router.navigate(['/app/catalog']);
      });
    });
  }
}
