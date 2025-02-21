import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AssociationService } from '../../../services/association.service';
import { Association } from '../../../interfaces/association.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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
                    <h5 class="heading fw-semibold mb-0 sub-heading text-white title-dark">Admin Dashboard</h5>
                </div>
            </div><!--end col-->
        </div><!--end row-->

        <div class="position-middle-bottom">
            <nav aria-label="breadcrumb" class="d-block">
                <ul class="breadcrumb breadcrumb-muted mb-0 p-0">
                    <li class="breadcrumb-item"><a [routerLink]="'/'">solidarity</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Admin Dashboard</li>
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

    
    <section class="section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h3 class="mb-4">Admin Dashboard</h3>
            
            <!-- Stats Cards -->
            <div class="row g-4 mb-4">
              <div class="col-md-4">
                <div class="card bg-primary text-white">
                  <div class="card-body">
                    <h5 class="card-title">Total Associations</h5>
                    <h2>{{associations.length}}</h2>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card bg-success text-white">
                  <div class="card-body">
                    <h5 class="card-title">Verified Associations</h5>
                    <h2>{{getVerifiedCount()}}</h2>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card bg-warning text-white">
                  <div class="card-body">
                    <h5 class="card-title">Pending Verification</h5>
                    <h2>{{getPendingCount()}}</h2>
                  </div>
                </div>
              </div>
            </div>

            <!-- Associations Table -->
            <div class="card shadow border-0 p-4">
              <h5 class="card-title">Manage Associations</h5>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let association of associations">
                      <td>{{association.name}}</td>
                      <td>{{association.email}}</td>
                      <td>
                        <span [class]="'badge ' + getStatusBadgeClass(association.verificationStatus)">
                          {{association.verificationStatus}}
                        </span>
                      </td>
                      <td>{{association.createdAt | date}}</td>
                      <td>
                        <button class="btn btn-sm btn-primary me-2" 
                                [routerLink]="['/admin/associations', association.id]">
                          View Details
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <app-footer />
  `,
  styles: [`
    .card {
      transition: all 0.3s ease;
      &:hover {
        transform: translateY(-5px);
      }
    }
    .badge {
      padding: 0.5em 1em;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  associations: Association[] = [];

  constructor(private associationService: AssociationService) {}

  ngOnInit() {
    // Load all associations
    this.loadAssociations();
  }

  loadAssociations() {
    // For now, get from localStorage
    const associations: Association[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('association_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          associations.push(JSON.parse(stored));
        }
      }
    }
    this.associations = associations;
  }

  getVerifiedCount(): number {
    return this.associations.filter(a => a.verificationStatus === 'verified').length;
  }

  getPendingCount(): number {
    return this.associations.filter(a => a.verificationStatus === 'pending').length;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'verified': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
} 