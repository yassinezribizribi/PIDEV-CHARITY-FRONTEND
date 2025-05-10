import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, NgForm, NgModel } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationErrorService {

  isInvalid(control: NgModel): boolean {
    return !!(control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(control: NgModel): string {
    if (control.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength}`;
      if (control.errors['maxlength']) return `Maximum length is ${control.errors['maxlength'].requiredLength}`;
      if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
      if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}`;
      if (control.errors['serverError']) return control.errors['serverError'];
    }
    return '';
  }

  applyServerValidationErrors(errors: any[], form: FormGroup): void {
    errors.forEach(error => {
      const control = form.get(error.field);
      if (control) {
        control.setErrors({ serverError: error.message });
      }
    });
  }

  markAllFieldsAsTouched(form: FormGroup) {
    Object.keys(form.controls).forEach(field => {
      const control = form.get(field);
      if (control) {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }
  
}
