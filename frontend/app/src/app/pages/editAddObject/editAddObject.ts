import { Component, OnInit, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ObjectService } from '../../services/object.service';
import { CreateObjectData } from '../../models/object-data.model';
import { ButtonComponent } from '../../components/button/button';

@Component({
  selector: 'app-editAddObject',
  imports: [FormField, ButtonComponent, RouterLink],
  templateUrl: './editAddObject.html',
})
export class EditAddObject implements OnInit {
  private objectService = inject(ObjectService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private objectId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.objectId;

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
    if (this.objectId) {
      this.objectService.findOne(Number(this.objectId)).subscribe((data) => {
        this.objectModel.set({
          name: data.name,
          type: data.type,
          description: data.description ?? '',
          condition: data.condition,
          isAvailable: data.isAvailable,
        });
      });
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.objectForm, async () => {
      let request;
      if (this.objectId) {
        request = this.objectService.update(Number(this.objectId), this.objectModel());
      } else {
        request = this.objectService.create(this.objectModel());
      }

      request.subscribe(() => {
        this.router.navigate(['/app/catalog']);
      });
    });
  }
}
