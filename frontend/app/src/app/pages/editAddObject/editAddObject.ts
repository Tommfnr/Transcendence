import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ObjectService } from '../../services/object.service';
import { CreateObjectData } from '../../models/object-data.model';
import { ButtonComponent } from '../../components/button/button';

@Component({
  selector: 'app-editAddObject',
  imports: [FormField, ButtonComponent, RouterLink],
  templateUrl: './editAddObject.html',
})
export class EditAddObject {
  private objectService = inject(ObjectService);
  private router = inject(Router);

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

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.objectForm, async () => {
      this.objectService.create(this.objectModel()).subscribe(() => {
        this.router.navigate(['/app/catalog']);
      });
    });
  }
}
