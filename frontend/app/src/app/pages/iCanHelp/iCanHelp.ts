import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Modal } from '../../components/modal/modal';
import { DatePicker } from '../../components/date-picker/date-picker';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-iCanHelp',
  imports: [RouterLink, Modal, DatePicker],
  templateUrl: './iCanHelp.html',
})
export class ICanHelp {
  private modalService = inject(ModalService);

  // ISO string ("2026-10-05"), '' until a date is picked
  readonly date = signal('');

  onCancel(): void {
    this.modalService.close();
  }
}
