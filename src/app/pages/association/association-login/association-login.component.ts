import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AssociationService } from '../../../services/association.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { Association } from '../../../interfaces/association.interface';

@Component({
  selector: 'app-association-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <app-navbar />
      <!-- Hero Start -->
<section class="bg-half-170 d-table w-100" style="background: url('assets/images/hero/pages.jpg') center;">
    <div class="bg-overlay bg-gradient-overlay"></div>
    <div class="container">
        <div class="row mt-5 justify-content-center">
            <div class="col-12">
                <div class="title-heading text-center">
                    <h5 class="heading fw-semibold mb-0 sub-heading text-white title-dark">login association</h5>
                </div>
            </div><!--end col-->
        </div><!--end row-->

        <div class="position-middle-bottom">
            <nav aria-label="breadcrumb" class="d-block">
                <ul class="breadcrumb breadcrumb-muted mb-0 p-0">
                    <li class="breadcrumb-item"><a [routerLink]="'/'">Solidarity&Refugee</a></li>
                    <li class="breadcrumb-item active" aria-current="page">login association</li>
                </ul>
            </nav>
        </div>
    </div><!--end container-->
</section><!--end section-->

<div class="position-relative">
    <div class="shape overflow-hidden text-white">
        <svg viewBox="0 0 2880 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z" fill="currentColor"></path>
        </svg>
    </div>
</div>
<!-- Hero End -->
    
    <section class="bg-half-170 d-table w-100">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-5 col-md-8">
            <div class="card shadow rounded border-0">
              <div class="card-body">
                <h4 class="card-title text-center">Association Login</h4>
                
                <form class="login-form mt-4" (ngSubmit)="onSubmit()" #loginForm="ngForm">
                  <div class="row">
                    <div class="col-lg-12">
                      <div class="mb-3">
                        <label class="form-label">Email <span class="text-danger">*</span></label>
                        <input type="email" class="form-control" [(ngModel)]="credentials.email" name="email" required>
                      </div>
                    </div>

                    <div class="col-lg-12">
                      <div class="mb-3">
                        <label class="form-label">Password <span class="text-danger">*</span></label>
                        <input type="password" class="form-control" [(ngModel)]="credentials.password" name="password" required>
                      </div>
                    </div>

                    <div class="col-lg-12">
                      <div class="d-flex justify-content-between">
                        <div class="mb-3">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" [(ngModel)]="rememberMe" name="remember">
                            <label class="form-check-label">Remember me</label>
                          </div>
                        </div>
                        <a [routerLink]="['/reset-password']" class="text-dark h6 mb-0">Forgot password?</a>
                      </div>
                    </div>

                    <div class="col-lg-12 mb-0">
                      <div class="d-grid">
                        <button class="btn btn-primary" type="submit" [disabled]="!loginForm.form.valid">Sign in</button>
                      </div>
                    </div>

                    <div class="col-12 text-center mt-4">
                      <p class="mb-0">Don't have an account? 
                        <a [routerLink]="['/association-signup']" class="text-dark fw-bold">Sign Up</a>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <app-footer />
    <div *ngIf="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
  `
})
export class AssociationLoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  rememberMe = false;
  errorMessage = '';

  constructor(
    private associationService: AssociationService,
    private router: Router
  ) {}

  async onSubmit() {
    try {
      this.errorMessage = '';
      await this.associationService.login(this.credentials.email, this.credentials.password);
      
      // Add a test association if none exist
      if (!localStorage.getItem('association_test-1')) {
        const testAssociation: Association = {
          id: 'test-1',
          name: 'Test Association',
          email: this.credentials.email,
          password: btoa(this.credentials.password),
          phone: '+1234567890',
          address: '123 Test St',
          description: 'This is a test association',
          logo: 'assets/images/logo-placeholder.png',
          documents: {
            registrationDoc: 'mock-url-for-reg.pdf',
            legalDoc: 'mock-url-for-legal.pdf'
          },
          verificationStatus: 'verified',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          teamMembers: [],
          metrics: {
            totalAidCases: 0,
            activeAidCases: 0,
            totalEvents: 0,
            upcomingEvents: 0,
            totalDonations: 0,
            monthlyDonations: 0,
            totalBeneficiaries: 0,
            totalVolunteers: 0,
            engagement: {
              followers: 0,
              interactions: 0,
              shares: 0
            },
            recentActivity: []
          },
          statistics: {
            totalDonations: 0,
            totalBeneficiaries: 0,
            activeAidCases: 0,
            completedAidCases: 0
          },
          aidCases: [],
          events: [],
          mediaGallery: [],
          notifications: [],
          collaborations: []
        };
        localStorage.setItem(`association_${testAssociation.id}`, JSON.stringify(testAssociation));
      }

      this.router.navigate(['/association/account']);
    } catch (error: any) {
      console.error('Login failed:', error);
      this.errorMessage = error.message || 'Login failed. Please check your credentials.';
    }
  }
} 