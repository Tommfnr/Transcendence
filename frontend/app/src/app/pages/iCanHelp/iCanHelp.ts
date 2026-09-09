import { Component, inject } from '@angular/core';
import { Modal } from '../../components/modal/modal';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-iCanHelp',
  imports: [Modal],
  templateUrl: './iCanHelp.html',
})
export class ICanHelp {
  private modalService = inject(ModalService);

  onCancel(): void {
    this.modalService.close();
  }
}
