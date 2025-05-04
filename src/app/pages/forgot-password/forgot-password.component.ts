import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { FooterComponent } from '@component/footer/footer.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent, FooterComponent],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

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
      this.isLoading = true;
      const email = this.forgotPasswordForm.get('email')?.value;
  
      this.http
        .post('http://localhost:8089/api/users/forgot-password', { email }, { responseType: 'text' })
        .subscribe({
          next: (response) => {
            console.log("✅ Reset Token reçu :", response);
  
            // ✅ Stockage correct du reset_token
            localStorage.setItem('reset_token', response.trim());  // Supprime les espaces
            console.log("🔐 Reset Token stocké dans localStorage :", localStorage.getItem('reset_token'));
  
            this.successMessage = '✅ Un email de réinitialisation a été envoyé.';
            this.errorMessage = '';
            this.isLoading = false;
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading = false;
            this.errorMessage = error.status === 400
              ? '⚠ Email invalide ou non enregistré.'
              : '❌ Une erreur est survenue. Réessayez plus tard.';
          },
        });
    }
  }
}