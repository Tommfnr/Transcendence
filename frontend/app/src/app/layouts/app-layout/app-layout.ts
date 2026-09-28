import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EditAddObject } from '../../pages/editAddObject/editAddObject';
import { EditAddPost } from '../../pages/editAddPost/editAddPost';
import { EditAddGroup } from '../../pages/editAddGroup/editAddGroup';
import { ModalService } from '../../services/modal.service';
import { EditProfile } from '../../pages/editProfile/edit-profile';
import { HeaderAppDesktopComponent } from '../../components/header-app-desktop/header-app-desktop';
import { Offers } from '../../pages/offers/offers';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, EditAddObject, EditAddPost, EditAddGroup, EditProfile, HeaderAppDesktopComponent, Offers],
  templateUrl: './app-layout.html',
})
export class AppLayout {
  readonly modalService = inject(ModalService);
}
