import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { AssociationService } from '../../services/association.service';
import { Association } from '../../interfaces/association.interface';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-association-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <app-navbar></app-navbar>

    <!-- Hero Section -->
    <section class="bg-half-170 d-table w-100" style="background: url('assets/images/hero/pages.jpg') center;">
      <div class="bg-overlay bg-gradient-overlay"></div>
      <div class="container">
        <div class="row mt-5 justify-content-center">
          <div class="col-12">
            <div class="title-heading text-center">
              <h5 class="heading fw-semibold mb-0 sub-heading text-white title-dark">
                {{ association?.associationName || 'Association Profile' }}
              </h5>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Profile Content -->
    <section class="section">
      <div class="container">
        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading association profile...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="alert alert-danger" role="alert">
          <mat-icon>error_outline</mat-icon>
          {{ error }}
        </div>

        <!-- Association Profile -->
        <div *ngIf="association && !loading" class="row">
          <!-- Left Column - Logo and Quick Info -->
          <div class="col-lg-4 col-md-5">
            <div class="card border-0 shadow rounded-4 overflow-hidden">
              <!-- Logo -->
              <div class="position-relative">
                <img [src]="imageUrl || '/assets/images/default-logo.jpg'"
                     [alt]="association.associationName"
                     class="img-fluid w-100 object-fit-cover"
                     style="height: 200px;">
                <div class="position-absolute bottom-0 start-0 w-100 p-3"
                     style="background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);">
                  <h4 class="text-white mb-0">{{ association.associationName }}</h4>
                </div>
              </div>

              <!-- Quick Info -->
              <div class="card-body">
                <!-- Partnership Tier -->
                <div class="mb-4">
                  <div class="d-flex align-items-center mb-2">
                    <mat-icon [ngClass]="{
                      'text-warning': association.partnershipTier === 'Gold',
                      'text-secondary': association.partnershipTier === 'Silver',
                      'text-bronze': association.partnershipTier === 'Bronze'
                    }">{{ getTierIcon(association.partnershipTier || 'Bronze') }}</mat-icon>
                    <span class="ms-2 fw-semibold">{{ association.partnershipTier || 'Bronze' }} Partner</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-primary" 
                         [style.width.%]="getScorePercentage(association.partnershipScore)">
                    </div>
                  </div>
                  <small class="text-muted">
                    Partnership Score: {{ association.partnershipScore || 0 }}/100
                  </small>
                </div>

                <mat-divider></mat-divider>

                <!-- Location -->
                <div class="mt-4">
                  <div class="d-flex align-items-center mb-3">
                    <mat-icon class="text-primary">location_on</mat-icon>
                    <span class="ms-2">{{ association.associationAddress }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-grid gap-2 mt-4">
                  <button mat-flat-button color="primary" (click)="subscribe()">
                    <mat-icon>favorite</mat-icon>
                    Subscribe
                  </button>
                  <button mat-stroked-button color="primary" (click)="contact()">
                    <mat-icon>mail</mat-icon>
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Details -->
          <div class="col-lg-8 col-md-7">
            <div class="card border-0 shadow rounded-4">
              <div class="card-body p-4">
                <!-- About -->
                <div class="mb-5">
                  <h4 class="card-title mb-4">About Us</h4>
                  <p class="text-muted">{{ association.description }}</p>
                </div>

                <!-- Statistics -->
                <div class="row g-4 mb-5">
                  <div class="col-md-4">
                    <div class="card bg-soft-primary border-0 text-center p-3">
                      <h2 class="mb-0">{{ totalDonations }}</h2>
                      <p class="text-muted mb-0">Donations</p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card bg-soft-success border-0 text-center p-3">
                      <h2 class="mb-0">{{ totalMissions }}</h2>
                      <p class="text-muted mb-0">Missions</p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card bg-soft-warning border-0 text-center p-3">
                      <h2 class="mb-0">{{ totalSubscribers }}</h2>
                      <p class="text-muted mb-0">Subscribers</p>
                    </div>
                  </div>
                </div>

                <!-- Recent Activity -->
                <div>
                  <h4 class="card-title mb-4">Recent Activity</h4>
                  <div class="timeline-page pt-2 position-relative">
                    <div *ngFor="let activity of recentActivities" class="timeline-item mt-4">
                      <div class="d-flex">
                        <div class="avatar avatar-md-sm">
                          <div class="avatar-content bg-soft-primary rounded">
                            <mat-icon>{{ activity.icon }}</mat-icon>
                          </div>
                        </div>
                        <div class="ms-3">
                          <h6 class="mb-0">{{ activity.title }}</h6>
                          <small class="text-muted">{{ activity.date | date }}</small>
                          <p class="text-muted mt-2 mb-0">{{ activity.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <app-footer></app-footer>
    <app-scroll-to-top></app-scroll-to-top>

    <!-- Contact Modal -->
    <ng-template #contactModal>
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title">
          <mat-icon class="me-2">mail</mat-icon>
          Contact Association
        </h5>
        <button type="button" class="close-button" aria-label="Close" (click)="closeModal()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="modal-body">
        <form #contactForm="ngForm" (ngSubmit)="sendMessage()">
          <div class="mb-4">
            <label for="senderEmail" class="form-label">
              <mat-icon class="me-2">person</mat-icon>
              Your Email
            </label>
            <input type="email" class="form-control" id="senderEmail" [(ngModel)]="contactData.senderEmail" name="senderEmail" required readonly>
          </div>
          <div class="mb-4">
            <label for="receiverEmail" class="form-label">
              <mat-icon class="me-2">business</mat-icon>
              Association Email
            </label>
            <input type="email" class="form-control" id="receiverEmail" [(ngModel)]="contactData.receiverEmail" name="receiverEmail" required readonly>
          </div>
          <div class="mb-4">
            <label for="subject" class="form-label">
              <mat-icon class="me-2">subject</mat-icon>
              Subject
            </label>
            <input type="text" class="form-control" id="subject" [(ngModel)]="contactData.subject" name="subject" required>
          </div>
          <div class="mb-4">
            <label for="message" class="form-label">
              <mat-icon class="me-2">message</mat-icon>
              Message
            </label>
            <textarea class="form-control" id="message" rows="5" [(ngModel)]="contactData.message" name="message" required></textarea>
          </div>
          <div class="text-end">
            <button type="button" class="btn btn-light me-2" (click)="closeModal()">
              <mat-icon class="me-1">close</mat-icon>
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="!contactForm.valid">
              <mat-icon class="me-1">send</mat-icon>
              Send Message
            </button>
          </div>
        </form>
      </div>
    </ng-template>
  `,
  styles: [`
    .text-bronze {
      color: #CD7F32;
    }

    .bg-soft-primary {
      background-color: rgba(47, 85, 212, 0.1);
    }

    .bg-soft-success {
      background-color: rgba(40, 167, 69, 0.1);
    }

    .bg-soft-warning {
      background-color: rgba(255, 193, 7, 0.1);
    }

    .avatar {
      height: 45px;
      width: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .timeline-page {
      &::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 22px;
        width: 2px;
        background: #e9ecef;
      }
    }

    .timeline-item {
      position: relative;
      padding-left: 10px;
      &::after {
        content: '';
        position: absolute;
        top: 22px;
        left: -18px;
        width: 12px;
        height: 12px;
        background: #fff;
        border: 2px solid #2f55d4;
        border-radius: 50%;
        z-index: 1;
      }
    }

    /* Enhanced Modal styles */
    .modal-content {
      border-radius: 15px;
      border: none;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .modal-header {
      border-bottom: none;
      padding: 1.5rem;
      border-radius: 15px 15px 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .close-button {
      background: none;
      border: none;
      padding: 0.5rem;
      margin: -0.5rem;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .close-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    .close-button mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-control {
      border-radius: 8px;
      border: 1px solid #ddd;
      padding: 0.75rem;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      border-color: #2f55d4;
      box-shadow: 0 0 0 0.2rem rgba(47, 85, 212, 0.25);
    }

    .form-control[readonly] {
      background-color: #f8f9fa;
      cursor: not-allowed;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background-color: #2f55d4;
      border-color: #2f55d4;
    }

    .btn-primary:hover {
      background-color: #2443b0;
      border-color: #2443b0;
      transform: translateY(-1px);
    }

    .btn-light {
      background-color: #f8f9fa;
      border-color: #f8f9fa;
    }

    .btn-light:hover {
      background-color: #e9ecef;
      border-color: #e9ecef;
    }

    .form-label {
      display: flex;
      align-items: center;
      font-weight: 500;
      color: #2d3748;
    }

    mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      line-height: 20px;
    }
  `]
})
export class AssociationProfileComponent implements OnInit {
  @ViewChild('contactModal') contactModal: any;
  
  association: Association | null = null;
  loading = true;
  error: string | null = null;
  imageUrl: SafeUrl | null = null;

  // Statistics
  totalDonations = 0;
  totalMissions = 0;
  totalSubscribers = 0;

  // Recent Activities
  recentActivities = [
    {
      icon: 'volunteer_activism',
      title: 'New Donation Campaign',
      date: new Date(),
      description: 'Started a new donation campaign for education support.'
    },
    {
      icon: 'groups',
      title: 'Mission Completed',
      date: new Date(Date.now() - 86400000), // 1 day ago
      description: 'Successfully completed the community outreach program.'
    },
    {
      icon: 'trending_up',
      title: 'Partnership Milestone',
      date: new Date(Date.now() - 172800000), // 2 days ago
      description: 'Reached Silver partnership tier.'
    }
  ];

  // Contact form data
  contactData = {
    senderEmail: '',
    receiverEmail: '',
    subject: '',
    message: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private associationService: AssociationService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.error = 'Association ID not found';
        this.loading = false;
        return;
      }

      this.loadAssociation(parseInt(id, 10));
    });
  }

  private loadAssociation(id: number) {
    this.associationService.getAssociationById(id).subscribe({
      next: (association) => {
        this.association = association;
        if (association.associationLogoPath) {
          this.loadImage(association.associationLogoPath);
        }
        this.loadStatistics();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading association:', err);
        this.error = 'Failed to load association details';
        this.loading = false;
      }
    });
  }

  private loadImage(filename: string): void {
    this.associationService.getAssociationLogo(filename).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: (err) => {
        console.error('Error loading image:', err);
        // Keep the default image
      }
    });
  }

  private loadStatistics() {
    // TODO: Implement actual statistics loading
    this.totalDonations = Math.floor(Math.random() * 50) + 10;
    this.totalMissions = Math.floor(Math.random() * 30) + 5;
    this.totalSubscribers = Math.floor(Math.random() * 1000) + 100;
  }

  getTierIcon(tier: string): string {
    switch (tier.toLowerCase()) {
      case 'gold':
        return 'military_tech';
      case 'silver':
        return 'workspace_premium';
      case 'bronze':
        return 'emoji_events';
      default:
        return 'emoji_events';
    }
  }

  getScorePercentage(score: number | undefined): number {
    return score || 0;
  }

  subscribe() {
    // TODO: Implement subscription logic
    console.log('Subscribe clicked');
  }

  contact() {
    if (!this.association) return;

    // Get current user's email
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastr.error('Please log in to contact the association');
      return;
    }

    // Get association email
    this.associationService.getUserEmailByAssociationId(this.association.idAssociation).subscribe({
      next: (email) => {
        // Set up contact form data
        this.contactData = {
          senderEmail: currentUser.email,
          receiverEmail: email,
          subject: '',
          message: ''
        };

        // Show the modal
        this.modalService.open(this.contactModal, { 
          centered: true,
          size: 'lg',
          backdrop: 'static',
          keyboard: false
        });
      },
      error: () => {
        this.toastr.error('Failed to get association email. Please try again.');
      }
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  sendMessage() {
    if (!this.association) return;

    // Here you would typically call your email service
    // For now, we'll just show a success message
    this.toastr.success('Message sent successfully');
    
    // Close the modal
    this.closeModal();

    // Reset the form
    this.contactData = {
      senderEmail: this.contactData.senderEmail,
      receiverEmail: this.contactData.receiverEmail,
      subject: '',
      message: ''
    };
  }
} 