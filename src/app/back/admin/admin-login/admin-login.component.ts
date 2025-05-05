import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    NavbarComponent,
    FooterComponent,
    RouterLink
  ],
  template: `
    <app-navbar />
    <section class="bg-half-170 d-table w-100" style="background: url('assets/images/hero/pages.jpg') center;">
      <div class="bg-overlay bg-gradient-overlay"></div>
      <div class="container">
        <div class="row mt-5 justify-content-center">
          <div class="col-12">
            <div class="title-heading text-center">
              <h5 class="heading fw-semibold mb-0 sub-heading text-white title-dark"></h5>
            </div>
          </div>
        </div>

        <div class="position-middle-bottom">
          <nav aria-label="breadcrumb" class="d-block">
            <ul class="breadcrumb breadcrumb-muted mb-0 p-0">
              <li class="breadcrumb-item"><a [routerLink]="'/'">Solidarity&Refugee</a></li>
              <li class="breadcrumb-item active" aria-current="page"></li>
            </ul>
          </nav>
        </div>
      </div>
    </section>

    <div class="position-relative">
      <div class="shape overflow-hidden text-white">
        <svg viewBox="0 0 2880 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z" fill="currentColor"></path>
        </svg>
      </div>
    </div>

    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-body">
              <h4 class="text-center mb-4">Admin Login</h4>
              
              <form (ngSubmit)="onLogin()">
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input type="text" class="form-control" [(ngModel)]="email" name="email" required>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" class="form-control" [(ngModel)]="password" name="password" required>
                </div>

                <div *ngIf="error" class="alert alert-danger">
                  {{ error }}
                </div>

                <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <app-footer />
  `
})
export class AdminLoginComponent {
  error = '';
  loading = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  email: string = '';
  password: string = '';
  
  onLogin() {
    this.loading = true;
    this.adminService.login(this.email, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('jwt_token', response.token);
        this.router.navigate(['/app-admin-dashboard']);
      },
      error: (error) => {
        this.error = "Nom d'utilisateur ou mot de passe incorrect.";
        console.error('Erreur de login', error);
        this.loading = false;
      }
    });
  }
  

}
