import { Component, inject   } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router  } from '@angular/router'; 
import { HttpClientModule } from '@angular/common/http';
import { SignupService } from 'src/app/services/sign-up.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule, HttpClientModule,RouterLink]
})
export class SignupComponent {
  signupForm!: FormGroup;
  private signupService = inject(SignupService);
  private router = inject(Router);
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor() {
    this.signupForm = new FormGroup({
      firstname: new FormControl('', [Validators.required, Validators.minLength(2)]),
      lastname: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('REFUGEE', [Validators.required]),
      telephone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8,}$')]),
      location: new FormControl('', [Validators.required]),
      job: new FormControl(''),
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.signupForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control.hasError('pattern')) {
      if (controlName === 'telephone') {
        return 'Please enter a valid phone number (minimum 8 digits)';
      }
    }
    return '';
  }

  register() {
    if (this.signupForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      this.signupService.register(this.signupForm.value).subscribe({
        next: (response) => {
          console.log("Response:", response);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isSubmitting = false;
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'An error occurred during registration. Please try again.';
          }
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}