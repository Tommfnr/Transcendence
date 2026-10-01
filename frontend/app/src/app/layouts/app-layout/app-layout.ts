import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderApp } from '../../components/header-app/header-app';
import { FooterApp } from '../../components/footer-app/footer-app';
import { EditAddObject } from '../../pages/editAddObject/editAddObject';
import { EditAddPost } from '../../pages/editAddPost/editAddPost';
import { EditAddGroup } from '../../pages/editAddGroup/editAddGroup';
import { ModalService } from '../../services/modal.service';
import { ChatSocketService } from '../../services/chat-socket.service';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, HeaderApp, FooterApp, EditAddObject, EditAddPost, EditAddGroup],
  templateUrl: './app-layout.html',
})
export class AppLayout implements OnInit, OnDestroy {
  readonly modalService = inject(ModalService);
  private chatSocket = inject(ChatSocketService);

  // One socket for the whole logged-in area, shared by every chat component
  ngOnInit(): void {
    this.chatSocket.connect();
  }

  ngOnDestroy(): void {
    this.chatSocket.disconnect();
  }
}
