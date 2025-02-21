import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AssociationService } from '../../../services/association.service';
import { EmailService } from '../../../services/email.service';
import { Association } from '../../../interfaces/association.interface';

@Component({
  selector: 'app-association-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <app-navbar />
    
    <section class="section">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-9">
            <div *ngIf="loading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div *ngIf="association" class="card shadow rounded-md border-0">
              <div class="card-body p-4">
                <h4 class="mb-4">Association Details</h4>
                
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>Name:</strong> {{association.name}}</p>
                    <p><strong>Email:</strong> {{association.email}}</p>
                    <p><strong>Phone:</strong> {{association.phone}}</p>
                    <p><strong>Address:</strong> {{association.address}}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>Status:</strong> {{association.verificationStatus}}</p>
                    <p><strong>Created:</strong> {{association.createdAt | date}}</p>
                    <p *ngIf="association.verificationDate">
                      <strong>Verified:</strong> {{association.verificationDate | date}}
                    </p>
                  </div>
                </div>

                <div class="mt-4">
                  <h5>Description</h5>
                  <p>{{association.description}}</p>
                </div>

                <div class="mt-4">
                  <h5>Documents</h5>
                  <div class="d-flex gap-2">
                    <a [href]="association.documents.registrationDoc" 
                       class="btn btn-soft-primary"
                       target="_blank">
                      View Registration Document
                    </a>
                    <a [href]="association.documents.legalDoc" 
                       class="btn btn-soft-primary"
                       target="_blank">
                      View Legal Document
                    </a>
                  </div>
                </div>

                <div class="mt-4" *ngIf="association.verificationStatus === 'pending'">
                  <div class="d-flex gap-2">
                    <button class="btn btn-success" (click)="verifyAssociation()">
                      Verify Association
                    </button>
                    <button class="btn btn-danger" (click)="rejectAssociation()">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <app-footer />
  `
})
export class AssociationDetailsComponent implements OnInit {
  association: Association | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private associationService: AssociationService,
    private emailService: EmailService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.associationService.getAssociationById(id).subscribe({
        next: (association) => {
          this.association = association;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading association:', error);
          this.loading = false;
        }
      });
    }
  }

  async verifyAssociation() {
    if (!this.association) return;
    
    try {
      const updated = await this.associationService.updateAssociation(
        this.association.id,
        { 
          verificationStatus: 'verified',
          verificationDate: new Date()
        }
      );
      
      // Send verification email
      await this.emailService.sendEmail(
        this.emailService.getVerificationEmailTemplate(updated)
      );
      
      this.association = updated;
    } catch (error) {
      console.error('Failed to verify association:', error);
    }
  }

  async rejectAssociation() {
    if (!this.association) return;
    
    try {
      const updated = await this.associationService.updateAssociation(
        this.association.id,
        { verificationStatus: 'rejected' }
      );
      this.association = updated;
    } catch (error) {
      console.error('Failed to reject association:', error);
    }
  }
} 