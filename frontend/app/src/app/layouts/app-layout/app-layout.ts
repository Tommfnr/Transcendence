import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterApp } from '../../components/footer-app/footer-app';
import { EditAddObject } from '../../pages/editAddObject/editAddObject';
import { EditAddPost } from '../../pages/editAddPost/editAddPost';
import { EditAddGroup } from '../../pages/editAddGroup/editAddGroup';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, EditAddObject, EditAddPost, EditAddGroup],
  templateUrl: './app-layout.html',
})
export class AppLayout {
  readonly modalService = inject(ModalService);
}
