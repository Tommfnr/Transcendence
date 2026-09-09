import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ObjectService } from '../../services/object.service';
import { ObjectData } from '../../models/object-data.model';
import { ButtonComponent } from '../../components/button/button';
import { ButtonDirective } from '../../components/button/button.directive';

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, ButtonComponent, ButtonDirective],
  templateUrl: './catalog.html',
})

export class Catalog implements OnInit {
  private objectService = inject(ObjectService);
  readonly objectData = signal<ObjectData[]>([]);

  ngOnInit(): void {
    this.objectService.findMy().subscribe((data) => { this.objectData.set(data); });
  }

  deleteObject(id: number): void {
    this.objectService.remove(id).subscribe(() => {
      this.objectData.update((objects) => objects.filter((object) => object.id !== id));
    });
  }
}