import { Component, ElementRef, computed, inject, input, model, output, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { ButtonDirective } from '../button/button.directive';

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

// "5/1/2026" must become "2026-01-05", never "2026-1-5"
const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayIso = () => {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
};

interface DayCell {
  day: number;
  iso: string;
  disabled: boolean;
}

/**
 * Date field with a calendar that opens below it.
 *
 * The value is an ISO string ("2026-12-25"), or '' when empty — never a
 * Date object: no timezone shift, and two dates compare with === or <.
 *
 * Signal Forms: <app-date-picker [formField]="myForm.startDate" />
 * Standalone:   <app-date-picker [(value)]="startDate" />
 * As a button:  <app-date-picker appearance="button" [(value)]="startDate" />
 *
 * The calendar sits in the normal flow and pushes content down instead of
 * floating: inside a scrolling container (our modals are overflow-y-auto),
 * a floating calendar would be clipped at the bottom.
 */
@Component({
  selector: 'app-date-picker',
  imports: [ButtonDirective],
  host: {
    class: 'block w-full max-w-68',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
  templateUrl: './date-picker.html',
})
export class DatePicker implements FormValueControl<string> {
  // Required by FormValueControl: [formField] keeps it in sync with the form
  readonly value = model('');

  // Optional FormValueControl members, bound automatically by [formField]
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly touch = output<void>();

  // Not named min/max: those names are reserved by FormValueControl
  readonly minDate = input<string>();
  readonly maxDate = input<string>();
  readonly placeholder = input('Choisir une date…');
  readonly appearance = input<'field' | 'button'>('field');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly weekdays = WEEKDAYS;
  protected readonly today = todayIso();
  protected readonly isOpen = signal(false);
  private readonly viewYear = signal(0);
  private readonly viewMonth = signal(0);

  protected readonly showError = computed(() => this.invalid() && this.touched());

  protected readonly display = computed(() => {
    if (!this.value()) return '';
    const [y, m, d] = this.value().split('-');
    return `${d}/${m}/${y}`;
  });

  protected readonly monthLabel = computed(() => `${MONTHS[this.viewMonth()]} ${this.viewYear()}`);

  protected readonly cells = computed<(DayCell | null)[]>(() => {
    const y = this.viewYear();
    const m = this.viewMonth();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const min = this.minDate();
    const max = this.maxDate();

    const blanks = Array.from({ length: offset }, () => null);
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const iso = toIso(y, m, i + 1);
      // ISO strings sort like dates, so < and > are enough
      return { day: i + 1, iso, disabled: (!!min && iso < min) || (!!max && iso > max) };
    });
    return [...blanks, ...days];
  });

  toggle(): void {
    if (this.isOpen()) return this.close();
    if (this.disabled()) return;

    // Open on the selected date, else today — or minDate if it is later
    const today = todayIso();
    const min = this.minDate();
    const start = this.value() || (min && min > today ? min : today);
    const [y, m] = start.split('-').map(Number);
    this.viewYear.set(y);
    this.viewMonth.set(m - 1);
    this.isOpen.set(true);
  }

  close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.touch.emit();
  }

  shiftMonth(delta: number): void {
    // Date rolls month 12 over to January of the next year, and -1 to December
    const d = new Date(this.viewYear(), this.viewMonth() + delta, 1);
    this.viewYear.set(d.getFullYear());
    this.viewMonth.set(d.getMonth());
  }

  pick(iso: string): void {
    this.value.set(iso);
    this.close();
  }

  clear(): void {
    this.value.set('');
    this.touch.emit();
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }
}
