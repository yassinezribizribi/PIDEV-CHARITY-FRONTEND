import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { FooterComponent } from '@component/footer/footer.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [ReactiveFormsModule, CommonModule,NavbarComponent,FooterComponent],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      this.http.post('http://localhost:8089/examen/user/forgot-password', { email }, { responseType: 'text' })
        .subscribe(
          (response) => {
            console.log('Password reset email sent to:', email);
            this.router.navigate(['/login']);
          },
          (error) => {
            console.error('Error sending reset email', error);
          }
        );
    }
  }
  
  
}