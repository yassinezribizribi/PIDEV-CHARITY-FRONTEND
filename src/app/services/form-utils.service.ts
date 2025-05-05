// src/app/shared/services/form-utils.service.ts

import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class FormUtilsService {

  markAllFieldsAsTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });

      if (control instanceof FormGroup) {
        this.markAllFieldsAsTouched(control); // recursion for nested groups
      }
    });
  }

  scrollToFirstInvalidField(formGroup: FormGroup): void {
    for (const key of Object.keys(formGroup.controls)) {
      const control = formGroup.get(key);
      if (control && control.invalid) {
        const invalidElement = document.querySelector(`[formControlName="${key}"]`);
        if (invalidElement) {
          (invalidElement as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
          (invalidElement as HTMLElement).focus();
        }
        break;
      }
    }
  }

  validateForm(formGroup: FormGroup): boolean {
    this.markAllFieldsAsTouched(formGroup);
    this.scrollToFirstInvalidField(formGroup);
    return formGroup.valid;
  }
}
