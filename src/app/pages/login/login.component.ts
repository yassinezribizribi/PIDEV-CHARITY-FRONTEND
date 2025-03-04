import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { jwtDecode } from 'jwt-decode';


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

  login() {
    if (this.loginForm.invalid) {
      console.log("test")
      console.log(this.loginForm)
      return;
    }
  
    const credentials = this.loginForm.value;
    console.log('Login data being sent:', credentials);
  
    this.authService.login(credentials).subscribe(
      (response: any) => {
        console.log('Login successful:', response);
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          console.log('Token saved:', response.token); // Check if token is saved
          try {
            const decodedToken: any = jwtDecode(response.token);
            console.log(decodedToken.roles.includes('ROLE_ADMIN'));
            
            if (decodedToken && decodedToken.roles && Array.isArray(decodedToken.roles)) {
              if (decodedToken.roles.includes('ROLE_ADMIN')) {
                this.router.navigate(['/admin/formations']).then(success => {
                  if (!success) console.error('Navigation to /admin/formations failed');
                });
              } else {
                this.router.navigate(['/index']).then(success => {
                  if (!success) console.error('Navigation to /onepage failed');
                });
              }
            } else {
              console.error('Invalid token structure:', decodedToken);
              this.errorMessage = 'Login failed: Invalid token';
            }
          } catch (error) {
            console.error('Token decoding failed:', error);
            this.errorMessage = 'Login failed: Unable to decode token';
          }
          
          console.log('rrrrttttt')
        } else {
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
