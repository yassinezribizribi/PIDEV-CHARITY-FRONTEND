import { Component, inject   } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router  } from '@angular/router'; 
import { HttpClientModule } from '@angular/common/http';
import { SignupService } from 'src/app/services/sign-up.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

  constructor() {
    this.signupForm = new FormGroup({
      firstname: new FormControl(''),
      lastname: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl(''),
      role: new FormControl('REFUGEE'),
      telephone: new FormControl(''),
      location: new FormControl(''), // <-- Ajouté ici pour la location

      job: new FormControl(''),
    });
  }

  register() {
    if (this.signupForm.valid) {
        console.log("Form Data:", this.signupForm.value);
        this.signupService.register(this.signupForm.value).subscribe((response) => {
          console.log("Response:", response);
          this.router.navigate(['/login']);
        });
    } else {
      console.log("Form is invalid");
    }
  }
}
