import { Component, inject, signal } from '@angular/core';
import { DatePicker } from '../../components/date-picker/date-picker';

@Component({
  selector: 'app-iCanHelp',
  imports: [DatePicker],
  templateUrl: './iCanHelp.html',
})
export class ICanHelp {

  // ISO string ("2026-10-05"), '' until a date is picked
  readonly date = signal('');

}
