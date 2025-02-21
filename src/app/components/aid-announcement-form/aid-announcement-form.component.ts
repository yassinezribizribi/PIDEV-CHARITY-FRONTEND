import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AidAnnouncement } from '../../interfaces/aid-announcement.interface';
import { AidService } from '../../services/aid.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-aid-announcement-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #aidForm="ngForm">
      <div class="mb-3">
        <label class="form-label">Title</label>
        <input type="text" class="form-control" [(ngModel)]="formData.title" name="title" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea class="form-control" [(ngModel)]="formData.description" name="description" rows="3" required></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">Type</label>
        <select class="form-select" [(ngModel)]="formData.type" name="type" required>
          <option value="medical">Medical Aid</option>
          <option value="financial">Financial Support</option>
          <option value="supplies">Supplies</option>
          <option value="housing">Housing</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Urgency Level</label>
        <select class="form-select" [(ngModel)]="formData.urgencyLevel" name="urgencyLevel" required>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Location</label>
        <div class="row">
          <div class="col-md-6">
            <input type="text" class="form-control" [(ngModel)]="formData.location.region" 
                   name="region" placeholder="Region" required>
          </div>
          <div class="col-md-6">
            <input type="text" class="form-control" [(ngModel)]="formData.location.city" 
                   name="city" placeholder="City">
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Beneficiary Information</label>
        <input type="text" class="form-control mb-2" [(ngModel)]="formData.beneficiary.name" 
               name="beneficiaryName" placeholder="Name" required>
        <textarea class="form-control" [(ngModel)]="formData.beneficiary.story" 
                  name="beneficiaryStory" rows="3" placeholder="Their story" required></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">Contact Information</label>
        <div class="row">
          <div class="col-md-6">
            <input type="tel" class="form-control mb-2" [(ngModel)]="formData.contactInfo.phone" 
                   name="phone" placeholder="Phone" required>
          </div>
          <div class="col-md-6">
            <input type="email" class="form-control mb-2" [(ngModel)]="formData.contactInfo.email" 
                   name="email" placeholder="Email" required>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-secondary" (click)="close()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="!aidForm.form.valid">
          Create Aid Case
        </button>
      </div>
    </form>
  `
})
export class AidAnnouncementFormComponent {
  @Input() association: any;
  
  formData: Partial<AidAnnouncement> = {
    type: 'financial',
    urgencyLevel: 'medium',
    status: 'active',
    location: { region: '' },
    beneficiary: { name: '', story: '' },
    contactInfo: { phone: '', email: '' }
  };

  constructor(
    private aidService: AidService,
    private modalService: ModalService
  ) {}

  async onSubmit() {
    try {
      const announcement = await this.aidService.createAnnouncement({
        ...this.formData,
        createdBy: {
          id: this.association.id,
          name: this.association.name,
          type: 'association'
        }
      });
      this.modalService.close();
      // Show success message
    } catch (error) {
      console.error('Failed to create aid announcement:', error);
      // Show error message
    }
  }

  close() {
    this.modalService.close();
  }
} 