import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink,CommonModule ],
  providers: [AuthService,AuthGuard],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';
  
constructor( private authService: AuthService,private router:Router){}

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  // Simplify the component's login method
login() {
  if (this.loginForm.invalid) {
    console.log("Form is invalid:", this.loginForm);
    return;
  }

  const credentials = this.loginForm.value;
  console.log('Login data being sent:', credentials);

  this.authService.login(credentials).subscribe(
    (response: any) => {
      console.log('Login successful:', response);
      if (!response.token) {
        console.error('No token received');
        this.errorMessage = 'Login failed: No token received';
      }
    },
    (error) => {
      console.error('Login failed:', error);
      this.errorMessage = 'Email or password incorrect';
    }
  );
}
  
}
