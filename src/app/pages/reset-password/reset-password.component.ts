import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { FooterComponent } from '@component/footer/footer.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [CommonModule, NavbarComponent, ReactiveFormsModule, FooterComponent],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  resetToken: string | null = null; // ✅ Stocke le resetToken récupéré

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // ✅ Récupérer le `resetToken` depuis le stockage local
    this.resetToken = localStorage.getItem('reset_token');

    if (!this.resetToken) {
      this.errorMessage = "⚠ Erreur : Aucun token de réinitialisation trouvé.";
      console.error("❌ Aucun resetToken trouvé !");
    } else {
      console.log("🔑 Reset Token récupéré :", this.resetToken);
    }
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.resetToken) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
  
      const { password, confirmPassword } = this.resetPasswordForm.value;
  
      if (password !== confirmPassword) {
        this.errorMessage = "⚠ Les mots de passe ne correspondent pas.";
        this.isLoading = false;
        return;
      }
  
      const resetRequest = {
        resetToken: this.resetToken, // ✅ Envoie bien le resetToken
        password: password
      };
  
      console.log("📤 Envoi de la requête avec :", resetRequest);
  
      this.http
        .post('http://localhost:8089/api/users/reset-password', resetRequest, { responseType: 'text' })
        .subscribe({
          next: () => {
            this.successMessage = '✅ Mot de passe réinitialisé avec succès !';
            this.errorMessage = '';
            this.isLoading = false;
  
            // ✅ Supprime le resetToken après usage
            localStorage.removeItem('reset_token');
  
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          },
          error: (error: HttpErrorResponse) => {
            this.isLoading = false;
            this.errorMessage = error.status === 400
              ? '⚠ Token invalide ou expiré.'
              : '❌ Une erreur est survenue. Réessayez plus tard.';
          },
        });
    } else {
      this.errorMessage = "⚠ Impossible de réinitialiser le mot de passe sans token.";
    }
  }
  
}
