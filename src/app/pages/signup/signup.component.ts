import { Component } from '@angular/core';
import { SignupService } from '../../services/sign-up.service';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common'; // ✅ Required for *ngFor and *ngIf
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ✅ Required for [(ngModel)]

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, FormsModule, ReactiveFormsModule] // ✅ Add FormsModule here
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  role: string = 'REFUGEE';
  roles: string[] = ['REFUGEE', 'ASSOCIATION_MEMBER', 'VOLUNTEER'];
  errorMessage: string = '';

  constructor(private signupService: SignupService) {}

  register() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and Password are required!';
      return;
    }

    const userData = {
      email: this.email,
      password: this.password,
      role: this.role
    };

    console.log("Sending data to backend:", userData);

    this.signupService.register(userData).subscribe({
      next: (response) => {
        console.log("Success:", response);
        alert("Signup Successful! 🎉");
      },
      error: (error) => {
        console.error("Error:", error);
        this.errorMessage = 'Signup failed! Try again.';
      }
    });
  }
}
