import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderApp } from '../../components/header-app/header-app';
import { FooterApp } from '../../components/footer-app/footer-app';
import { EditAddObject } from '../../pages/editAddObject/editAddObject';
import { ICanHelp } from '../../pages/iCanHelp/iCanHelp';
import { EditAddGroup } from '../../pages/editAddGroup/editAddGroup';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, HeaderApp, FooterApp, EditAddObject, ICanHelp, EditAddGroup],
  templateUrl: './app-layout.html',
})
export class AppLayout {
  readonly modalService = inject(ModalService);
}
