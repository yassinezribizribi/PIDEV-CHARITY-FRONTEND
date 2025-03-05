import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SignupService } from 'src/app/services/sign-up.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule, HttpClientModule, RouterLink]
})
export class SignupComponent {
  signupForm: FormGroup;
  private signupService = inject(SignupService);
  private router = inject(Router);

  constructor() {
    // Initialize the form with form controls and validators
    this.signupForm = new FormGroup({
      firstname: new FormControl(''),
      lastname: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl(''),
      role: new FormControl('REFUGEE'),
      telephone: new FormControl(''), // Optional, for validating phone number
      job: new FormControl(''),
    });
  }

  // Method for handling form submission
  register() {
    if (this.signupForm.valid) {
      console.log("✅ Sending registration request:", this.signupForm.value);
  
      this.signupService.register(this.signupForm.value).subscribe({
        next: (response) => {
          console.log("✅ Registration successful:", response);
  
          // Check if the role is ASSOCIATION_MEMBER and navigate accordingly
          if (this.signupForm.value.role === 'ASSOCIATION_MEMBER') {
            this.router.navigate(['/login']).then(() => {
              console.log("✅ Navigation to register-association successful");
            }).catch(err => {
              console.error("❌ Navigation error:", err);
            });
          } else {
            // Redirect to login page if role is not ASSOCIATION_MEMBER
            this.router.navigate(['/login']).then(() => {
              console.log("✅ Navigation to login successful");
            }).catch(err => {
              console.error("❌ Navigation error:", err);
            });
          }
        },
        error: (err) => {
          console.error("❌ Registration failed:", err);
        }
      });
    } else {
      console.log("❌ Form is invalid:", this.signupForm.errors);
    }
  }
  

  // Optional: You can create getter methods for easy access to form control errors
  get firstname() {
    return this.signupForm.get('firstname');
  }

  get lastname() {
    return this.signupForm.get('lastname');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get role() {
    return this.signupForm.get('role');
  }

  get telephone() {
    return this.signupForm.get('telephone');
  }

  get job() {
    return this.signupForm.get('job');
  }
}
