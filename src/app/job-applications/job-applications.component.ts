import { Component, OnInit } from '@angular/core';
import { JobApplicationService } from '../services/job-application.service';
import { JobApplication, JobApplicationStatus } from '../models/job-application.model';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FooterComponent } from '@component/footer/footer.component';

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

  constructor(
    private jobApplicationService: JobApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    
    // Listen for navigation events to handle state updates
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const navigation = this.router.getCurrentNavigation();
        const updatedApp = navigation?.extras.state?.['updatedApplication'];
        
        if (updatedApp) {
          const index = this.applications.findIndex(app => 
            app.idApplication === updatedApp.idApplication);
          if (index !== -1) {
            this.applications[index] = updatedApp;
          } else {
            // If new application, add it to the list
            this.applications.unshift(updatedApp);
          }
        }
      }
    });
  }

  loadApplications(): void {
    this.jobApplicationService.getAllJobApplications().subscribe({
      next: (data) => {
        // Ensure status values match the enum
        this.applications = data.map(app => ({
          ...app,
          jobApplicationStatus: this.normalizeStatus(app.jobApplicationStatus)
        }));
      },
      error: (err) => {
        console.error('Failed to load applications:', err);
      }
    });
  }

  private normalizeStatus(status: any): JobApplicationStatus {
    if (!status) return JobApplicationStatus.PENDING;
    
    // Convert to string and uppercase for comparison
    const statusStr = String(status).toUpperCase().trim();
    
    // Handle all possible variations
    if (statusStr === 'ACCEPTED' || statusStr === 'APPROVED') {
      return JobApplicationStatus.ACCEPTED;
    } else if (statusStr === 'REJECTED' || statusStr === 'DENIED') {
      return JobApplicationStatus.REJECTED;
    } else if (statusStr === 'PENDING' || statusStr === 'IN_REVIEW') {
      return JobApplicationStatus.PENDING;
    }
    
    console.warn('Unknown status value:', status);
    return JobApplicationStatus.PENDING; // Default fallback
  }

  getStatusDisplay(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.ACCEPTED: return 'Accepted';
      case JobApplicationStatus.REJECTED: return 'Rejected';
      case JobApplicationStatus.PENDING: return 'Pending';
      default: return 'Unknown';
    }
  }

  getStatusCount(status: JobApplicationStatus): number {
    return this.applications.filter(app => 
      this.normalizeStatus(app.jobApplicationStatus) === status).length;
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