import { Component, OnInit } from '@angular/core';
import { JobApplicationService } from '../services/job-application.service';
import { JobApplication, JobApplicationStatus } from '../models/job-application.model';
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FooterComponent } from '@component/footer/footer.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-job-applications',
  templateUrl: './job-applications.component.html',
  styleUrls: ['./job-applications.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    NavbarComponent,
    CommonModule,
    FooterComponent,
    DatePipe
  ]
})
export class JobApplicationsComponent implements OnInit {
  applications: JobApplication[] = [];
  JobApplicationStatus = JobApplicationStatus;
  isLoading = true;
  currentUserId: number | null = null;
  jobOfferId: number | null = null;

  constructor(
    private jobApplicationService: JobApplicationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserInfo().idUser;
    
    // Get job offer ID from route parameters
    this.route.params.subscribe(params => {
      this.jobOfferId = params['jobOfferId'] ? +params['jobOfferId'] : null;
    
      if (this.currentUserId) {
        this.loadApplications();
      } else {
        this.isLoading = false;
      }
    });
    
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const navigation = this.router.getCurrentNavigation();
        const updatedApp = navigation?.extras.state?.['updatedApplication'];
        
        if (updatedApp) {
          this.handleUpdatedApplication(updatedApp);
        }
      }
    });
  }

  private loadApplications(): void {
    this.isLoading = true;
    
    if (this.jobOfferId) {
      // Load applications for specific job offer
      this.jobApplicationService.getApplicationsForJobOffer(this.jobOfferId).subscribe({
        next: (data: JobApplication[]) => {
          this.applications = data.map(app => this.normalizeApplicationStatus(app));
        },
        error: (err: any) => {
          this.applications = [];
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Load all applications for current user
      this.jobApplicationService.getCurrentUserApplications().subscribe({
        next: (data: JobApplication[]) => {
          this.applications = data.map(app => this.normalizeApplicationStatus(app));
        },
        error: (err: any) => {
          this.applications = [];
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  private handleUpdatedApplication(updatedApp: JobApplication): void {
    const index = this.applications.findIndex(app => 
      app.idApplication === updatedApp.idApplication);
    
    if (index !== -1) {
      this.applications[index] = this.normalizeApplicationStatus(updatedApp);
    } else {
      this.applications.unshift(this.normalizeApplicationStatus(updatedApp));
    }
  }

  private normalizeApplicationStatus(application: JobApplication): JobApplication {
    const normalizedApp = {
      ...application,
      status: this.normalizeStatus(application.status || application.jobApplicationStatus),
      jobApplicationStatus: this.normalizeStatus(application.status || application.jobApplicationStatus),
      statusHistory: application.statusHistory || []
    };

    // Restructure applicant data from the backend format
    if (application.applicantId) {
      normalizedApp.applicant = {
        idUser: application.applicantId || 0,
        firstName: application.applicantName?.split(' ')[0] || '',
        lastName: application.applicantName?.split(' ')[1] || '',
        email: application.applicantEmail || '',
        telephone: application.applicantTelephone || '',
        isBanned: false,
        banreason: null,
        photo: null
      };
    }

    return normalizedApp;
  }

  private normalizeStatus(status: any): JobApplicationStatus {
    if (!status) return JobApplicationStatus.PENDING;
    
    const statusStr = String(status).toUpperCase().trim();
    
    switch (statusStr) {
      case 'PENDING':
      case 'UNDER_REVIEW':
      case 'INTERVIEW':
      case 'ACCEPTED':
      case 'REJECTED':
        return statusStr as JobApplicationStatus;
      default:
        console.warn('Unknown status value:', status);
        return JobApplicationStatus.PENDING;
    }
  }

  getStatusDisplay(status: JobApplicationStatus | undefined): string {
    if (!status) return 'Unknown Status';
    return status.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  }

  getStatusCount(status: JobApplicationStatus): number {
    return this.applications.filter(app => 
      app.status === status).length;
  }

  getLatestStatusNote(application: JobApplication): string | undefined {
    if (!application.statusHistory || application.statusHistory.length === 0) {
      return undefined;
    }
    const latestStatus = [...application.statusHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return latestStatus.notes;
  }

  deleteApplication(id: number): void {
    if (confirm('Are you sure you want to delete this application?')) {
      this.jobApplicationService.deleteJobApplication(id).subscribe({
        next: () => {
          this.applications = this.applications.filter(app => app.idApplication !== id);
        },
        error: (err) => {
          console.error('Failed to delete application:', err);
          alert('Failed to delete application. Please try again.');
        }
      });
    }
  }
}