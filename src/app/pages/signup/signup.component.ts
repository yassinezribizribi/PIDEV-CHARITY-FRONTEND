import { Component, inject   } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router  } from '@angular/router'; 
import { HttpClientModule } from '@angular/common/http';
import { SignupService } from 'src/app/services/sign-up.service';
@Component({
  selector: 'app-signup',
  standalone:true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule, HttpClientModule,RouterLink]
})
export class SignupComponent {
  signupForm!: FormGroup;
  private signupService = inject(SignupService);
  private router = inject(Router);

  constructor() {
    this.signupForm = new FormGroup({
      firstname: new FormControl(''),
      lastname: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl(''),
      role: new FormControl('REFUGEE'),
      telephone: new FormControl(''),
      job: new FormControl(''),
    });
  }

  register() {
    if (this.signupForm.valid) {
      console.log("✅ Sending registration request:", this.signupForm.value);
  
      this.signupService.register(this.signupForm.value).subscribe({
        next: (response) => {
          console.log("✅ Registration successful:", response);
          this.router.navigate(['/login']).then(() => {
            console.log("✅ Navigation to login successful");
          }).catch(err => console.error("❌ Navigation error:", err));
        },
        error: (err) => {
          console.error("❌ Registration failed:", err);
        }
      });
    } else {
      console.log("❌ Form is invalid:", this.signupForm.errors);

    }
  }
  
}
