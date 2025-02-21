import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
    FooterComponent
  ],
  template: `
    <app-navbar />
    
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-body">
              <h4 class="text-center mb-4">Admin Login</h4>
              
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input type="text" class="form-control" [(ngModel)]="username" name="username" required>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" class="form-control" [(ngModel)]="password" name="password" required>
                </div>

                <div *ngIf="error" class="alert alert-danger">
                  {{error}}
                </div>

                <button type="submit" class="btn btn-primary w-100">
                  Login
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
  username = '';
  password = '';
  error = '';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.adminService.login(this.username, this.password)) {
      this.router.navigate(['/admin']);
    } else {
      this.error = 'Invalid credentials';
    }
  }
} 