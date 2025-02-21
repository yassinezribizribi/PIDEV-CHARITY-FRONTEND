import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AssociationService } from '../../../services/association.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
  selector: 'app-association-signup',
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
                    <h5 class="heading fw-semibold mb-0 sub-heading text-white title-dark">register association</h5>
                </div>
            </div><!--end col-->
        </div><!--end row-->

        <div class="position-middle-bottom">
            <nav aria-label="breadcrumb" class="d-block">
                <ul class="breadcrumb breadcrumb-muted mb-0 p-0">
                    <li class="breadcrumb-item"><a [routerLink]="'/'">Solidarity&Refugee</a></li>
                    <li class="breadcrumb-item active" aria-current="page">register association</li>
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
          <div class="col-lg-8">
            <div class="card shadow rounded border-0">
              <div class="card-body">
                <h4 class="card-title text-center">Register Your Association</h4>
                
                <form class="login-form mt-4" (ngSubmit)="onSubmit()" #signupForm="ngForm">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Association Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" [(ngModel)]="formData.name" name="name" required>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Email <span class="text-danger">*</span></label>
                        <input type="email" class="form-control" [(ngModel)]="formData.email" name="email" required>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Password <span class="text-danger">*</span></label>
                        <input type="password" class="form-control" [(ngModel)]="formData.password" name="password" required>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Phone <span class="text-danger">*</span></label>
                        <input type="tel" class="form-control" [(ngModel)]="formData.phone" name="phone" required>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="mb-3">
                        <label class="form-label">Address <span class="text-danger">*</span></label>
                        <textarea class="form-control" [(ngModel)]="formData.address" name="address" rows="3" required></textarea>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="mb-3">
                        <label class="form-label">Description <span class="text-danger">*</span></label>
                        <textarea class="form-control" [(ngModel)]="formData.description" name="description" rows="4" required></textarea>
                      </div>
                    </div>
                    <div class="col-12">
                      <button class="btn btn-primary" type="submit" [disabled]="!signupForm.form.valid">Register Association</button>
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
  `
})
export class AssociationSignupComponent {
  formData: any = {};

  constructor(private associationService: AssociationService) {}

  async onSubmit() {
    try {
      await this.associationService.register(this.formData);
      // Show success message and redirect
    } catch (error) {
      console.error('Registration failed:', error);
      // Show error message
    }
  }
} 