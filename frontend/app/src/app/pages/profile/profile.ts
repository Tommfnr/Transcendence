import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ObjectService } from '../../services/object.service';
import { GroupsService } from '../../services/groups.service';
import { UsersService } from '../../services/users.service';
import { ObjectEntity } from '../../models/object.model';
import { GroupEntity } from '../../models/group.model';
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
  private groupsService = inject(GroupsService);
  private usersService = inject(UsersService);
  private router = inject(Router);
  user = this.refreshService.user;
  readonly modalService = inject(ModalService);

  objects = signal<ObjectEntity[] | null>(null);
  groups = signal<GroupEntity[] | null>(null);
  readonly errorMessage = signal<string | null>(null);

  openEditProfileModal(): void {
	this.modalService.openEditProfile();
  }

  onLogout(): void {
    this.refreshService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.refreshService.clearAccessToken();
        this.router.navigate(['/']);
      },
    });
  }

  objectsCount = computed(() => {
    const objects = this.objects();
    if (objects === null) return null;
    const count = objects.length;
    return `${count} item${count === 1 ? '' : 's'}`;
  });

  groupsCount = computed(() => {
    const groups = this.groups();
    if (groups === null) return null;
    const count = groups.length;
    return `${count} group${count === 1 ? '' : 's'}`;
  });

  ngOnInit(): void {
    this.objectService.findMy().subscribe({
      next: (objects) => this.objects.set(objects),
      error: (err) => console.error('Failed to load my objects', err),
    });
    this.groupsService.findMy().subscribe({
      next: (groups) => this.groups.set(groups),
      error: (err) => console.error('Failed to load my groups', err),
    });
  }

  onDeleteUser(): void {
    const user = this.user();
    if (!user) return;
    if (!confirm('Delete your account? This cannot be undone.')) return;

    this.errorMessage.set(null);
    this.usersService.remove(user.id).subscribe({
      // The backend already revoked the session, logout only clears the refresh cookie
      next: () => this.onLogout(),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Could not delete your account');
      },
    });
  }

}
