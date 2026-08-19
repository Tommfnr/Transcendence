// import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

// function dateRangeValidator(): ValidatorFn {
//   return (group: AbstractControl) => {
//     const from = group.get('lendedFrom')?.value;
//     const to = group.get('lendedTo')?.value;
//     if (from && to && new Date(to) <= new Date(from)) {
//       return { invalidRange: true };
//     }
//     return null;
//   };
// }

// form = new FormGroup({
//   lendedFrom: new FormControl<string>('', Validators.required),
//   lendedTo: new FormControl<string>('', Validators.required),
// }, { validators: dateRangeValidator() });

// submit() {
//   const rawFrom = this.form.value.lendedFrom!; // "2026-08-20"
//   const rawTo = this.form.value.lendedTo!;

//   // build Date from local calendar pieces, browser fill in local tz automatic
//   const lendedFrom = new Date(`${rawFrom}T00:00:00`).toISOString();
//   const lendedTo = new Date(`${rawTo}T23:59:59`).toISOString();

//   this.lendingService.create({ objectId, lendedFrom, lendedTo, message }).subscribe(/* ... */);
// }