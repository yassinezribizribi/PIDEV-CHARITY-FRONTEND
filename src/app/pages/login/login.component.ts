import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink,CommonModule ],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="login()">
      <input type="email" formControlName="email" placeholder="Email" required />
      <input type="password" formControlName="password" placeholder="Password" required />
      <button type="submit" [disabled]="loginForm.invalid">Login</button>
      <p *ngIf="errorMessage">{{ errorMessage }}</p>
    </form>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';

    constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }
  
    const credentials = this.loginForm.value;
    console.log('Login data being sent:', credentials);
  
    this.authService.login(credentials).subscribe(
      (response: any) => {
        console.log('Login successful:', response);
        localStorage.setItem('auth_token', response.token);
        this.router.navigate(['/home']); 
      },
      (error) => {
        console.error('Login failed:', error);
        this.errorMessage = 'Email ou mot de passe incorrect';
      }
    );
  }
  
}
