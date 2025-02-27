import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { FooterComponent } from '@component/footer/footer.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;  // ✅ Ajout de `!` pour éviter les erreurs TypeScript

  token: string | null = null;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 🔍 Récupérer le token depuis les paramètres de l’URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      console.log('🔍 Token récupéré depuis l’URL:', this.token);

      if (!this.token) {
        this.errorMessage = '❌ Token de réinitialisation manquant !';
      }
    });

    // ✅ Initialiser le formulaire ici après que `fb` soit bien défini
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token) {
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;
      const resetData = { token: this.token, newPassword: newPassword };

      console.log('📤 Envoi de la requête reset-password:', resetData);

      this.http.post('http://localhost:8089/examen/user/reset-password', resetData, {
        headers: { 'Content-Type': 'application/json' }
      }).subscribe(
        (response) => {
          console.log('✅ Password successfully reset');
          this.successMessage = 'Mot de passe réinitialisé avec succès!';
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        (error) => {
          console.error('❌ Erreur lors de la réinitialisation', error);
          this.errorMessage = 'Impossible de réinitialiser le mot de passe.';
        }
      );
    } else {
      console.error("❌ Token manquant ou formulaire invalide !");
      this.errorMessage = 'Token invalide ou champ vide.';
    }
  }
}
