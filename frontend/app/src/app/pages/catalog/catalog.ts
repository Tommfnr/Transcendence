import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ObjectService } from '../../services/object.service';
import { ObjectData } from '../../models/object-data.model';

@Component({
  selector: 'app-catalog',
  imports: [RouterLink],
  templateUrl: './catalog.html',
})

export class Catalog implements OnInit {
  private objectService = inject(ObjectService);
  readonly objectData = signal<ObjectData[]>([]);

  ngOnInit(): void {
    this.objectService.findAll().subscribe((data) => { this.objectData.set(data); });
  }
}