import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobApplicationService } from '../services/job-application.service';
import { Applicant, JobApplication, JobApplicationStatus } from '../models/job-application.model';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.css'],
  imports: [CommonModule, NavbarComponent, FormsModule, RouterLink],
  standalone: true
})
export class ApplicationDetailsComponent implements OnInit {
  jobApplication: JobApplication | null = null;
  JobApplicationStatus = JobApplicationStatus;
  loading = true;
  error: string | null = null;
  toastMessage: { type: 'success' | 'error', message: string } | null = null;
  rejectionReason = '';
  showDecisionModal = false;
  decisionType: 'accept' | 'reject' | null = null;
  processingDecision: 'accept' | 'reject' | null = null;
  currentDate = new Date();

  // Status display configuration with type safety
  private readonly statusBadgeClasses: Record<JobApplicationStatus, string> = {
    [JobApplicationStatus.PENDING]: 'bg-secondary',
    [JobApplicationStatus.UNDER_REVIEW]: 'bg-info',
    [JobApplicationStatus.INTERVIEW]: 'bg-primary',
    [JobApplicationStatus.ACCEPTED]: 'bg-success',
    [JobApplicationStatus.REJECTED]: 'bg-danger'
  };

  private readonly statusIcons: Record<JobApplicationStatus, string> = {
    [JobApplicationStatus.PENDING]: 'bi-hourglass',
    [JobApplicationStatus.UNDER_REVIEW]: 'bi-search',
    [JobApplicationStatus.INTERVIEW]: 'bi-calendar-event',
    [JobApplicationStatus.ACCEPTED]: 'bi-check-circle',
    [JobApplicationStatus.REJECTED]: 'bi-x-circle'
  };

  private readonly statusDisplay: Record<JobApplicationStatus, string> = {
    [JobApplicationStatus.PENDING]: 'Pending',
    [JobApplicationStatus.UNDER_REVIEW]: 'Under Review',
    [JobApplicationStatus.INTERVIEW]: 'Interview Scheduled',
    [JobApplicationStatus.ACCEPTED]: 'Accepted',
    [JobApplicationStatus.REJECTED]: 'Rejected'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobApplicationService: JobApplicationService
  ) {}

  ngOnInit(): void {
    this.loadApplication();
  }

  private loadApplication(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || isNaN(+id)) {
      this.error = 'Invalid application identifier';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.jobApplicationService.getJobApplicationById(+id).subscribe({
      next: (data) => {
        this.jobApplication = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Application load error:', err);
        this.error = 'Failed to load application details. Please check your connection.';
        this.loading = false;
      }
    });
  }

  handleDecision(action: 'accept' | 'reject'): void {
    this.decisionType = action;
    this.showDecisionModal = true;
  }

  cancelDecision(): void {
    this.showDecisionModal = false;
    this.decisionType = null;
    this.rejectionReason = '';
  }

  confirmDecision(): void {
    if (!this.decisionType || !this.jobApplication) return;

    this.processingDecision = this.decisionType;
    this.showDecisionModal = false;

    if (this.decisionType === 'accept') {
      this.acceptApplication();
    } else {
      this.rejectApplication();
    }
  }

  private acceptApplication(): void {
    if (!this.jobApplication) {
      console.error('Cannot accept application: jobApplication is null');
      return;
    }
    
    const applicationId = this.jobApplication.idApplication;
    this.jobApplicationService.acceptApplication(applicationId).subscribe({
      next: () => this.handleDecisionSuccess('accepted'),
      error: (err) => this.handleDecisionError(err, 'accept')
    });
  }

  private rejectApplication(): void {
    if (!this.jobApplication) {
      console.error('Cannot reject application: jobApplication is null');
      return;
    }
  
    const applicationId = this.jobApplication.idApplication;
    this.jobApplicationService.rejectApplication(applicationId).subscribe({
      next: () => this.handleDecisionSuccess('rejected'),
      error: (err) => this.handleDecisionError(err, 'reject')
    });
  }

  private handleDecisionSuccess(action: string): void {
    this.processingDecision = null;
    const newStatus = action === 'accepted' 
      ? JobApplicationStatus.ACCEPTED 
      : JobApplicationStatus.REJECTED;
    
    // Create a new object to ensure change detection
    this.jobApplication = {
      ...this.jobApplication!,
      jobApplicationStatus: newStatus
    };
    
    this.showToast('success', `Application ${action} successfully`);
    this.rejectionReason = '';
    
    // Navigate back with the updated application
    this.router.navigate(['/jobApplications'], {
      state: { updatedApplication: this.jobApplication }
    });
  }

  private handleDecisionError(error: any, action: string): void {
    console.error(`${action} error:`, error);
    this.processingDecision = null;
    this.showToast('error', `Failed to ${action} application. Please try again.`);
  }

  handleStatusChange(): void {
    if (!this.jobApplication) return;
    
    const newStatus = this.jobApplication.jobApplicationStatus === JobApplicationStatus.ACCEPTED 
      ? 'reject' : 'accept';
    
    this.decisionType = newStatus;
    this.showDecisionModal = true;
  }

  initials(applicant: Applicant): string {
    return `${applicant.firstName?.[0] || ''}${applicant.lastName?.[0] || ''}`.toUpperCase();
  }

  fullName(applicant: Applicant): string {
    return `${applicant.firstName} ${applicant.lastName}`.trim();
  }

  showToast(type: 'success' | 'error', message: string): void {
    this.toastMessage = { type, message };
    setTimeout(() => this.toastMessage = null, 5000);
  }

  retry(): void {
    this.error = null;
    this.loadApplication();
  }

  // Type-safe status methods
  getStatusBadgeClass(status: JobApplicationStatus): string {
    return this.statusBadgeClasses[status] ?? 'bg-secondary';
  }

  getStatusIcon(status: JobApplicationStatus): string {
    return this.statusIcons[status] ?? 'bi-question-circle';
  }

  getStatusDisplay(status: JobApplicationStatus): string {
    return this.statusDisplay[status] ?? 'Unknown Status';
  }
}