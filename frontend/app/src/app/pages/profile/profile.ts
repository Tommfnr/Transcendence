import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ObjectService } from '../../services/object.service';
import { ObjectEntity } from '../../models/object.model';
import { RefreshService } from '../../services/refresh.service';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { ListRowComponent } from '../../components/list-row/list-row';
import { ButtonDirective } from '../../components/button/button.directive';
import { AvatarComponent } from '../../components/avatar/avatar';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-profile',
  imports: [ TitleBarComponent, ListRowComponent, ButtonDirective, AvatarComponent ],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private refreshService = inject(RefreshService);
  private objectService = inject(ObjectService);
  user = this.refreshService.user;
  readonly modalService = inject(ModalService);

  objects = signal<ObjectEntity[] | null>(null);

  openEditProfileModal(): void {
	this.modalService.openEditProfile();
  }

  objectsCount = computed(() => {
    const objects = this.objects();
    if (objects === null) return null;
    const count = objects.length;
    return `${count} item${count === 1 ? '' : 's'}`;
  });

  ngOnInit(): void {
    this.objectService.findMy().subscribe({
      next: (objects) => this.objects.set(objects),
      error: (err) => console.error('Failed to load my objects', err),
    });
  }
}
