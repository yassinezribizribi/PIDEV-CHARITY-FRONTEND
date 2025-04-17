import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

import { JobOfferService } from '../../../services/jof-offer.service';
import { JobApplicationService } from '../../../services/job-application.service';
import { AuthService } from 'src/app/services/auth.service';

import { JobOffer } from '../../../models/job-offer.model';
import { JobApplication, JobApplicationStatus, Applicant } from '../../../models/job-application.model';

import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';

@Component({
  selector: 'app-job-opportunities-forum',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-opportunities-forum.component.html',
  styleUrls: ['./job-opportunities-forum.component.scss'],
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent, MatTooltipModule],
  standalone: true,
  providers: [JobOfferService, JobApplicationService]
})
export class JobOpportunitiesForumComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  filteredOffers: JobOffer[] = [];
  currentUserId: number | null = null;
  currentUserEmail: string | null = null;
  appliedJobs: { [key: number]: JobApplication } = {};
  newJobOffer: JobOffer = { 
    idJobOffer: 0, 
    title: '', 
    description: '', 
    requirements: '', 
    active: true, 
    forumId: 1 
  };
  
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';
  statusFilter: string = 'all';
  sortOption: string = 'newest';
  selectedApplication: JobApplication | null = null;
  showStatusModal = false;
  
  statusTimeline = [
    { 
      status: 'PENDING' as JobApplicationStatus, 
      icon: 'fa-hourglass-start', 
      label: 'Pending',
      color: 'secondary'
    },
    { 
      status: 'UNDER_REVIEW' as JobApplicationStatus, 
      icon: 'fa-search-plus', 
      label: 'Review',
      color: 'info'
    },
    { 
      status: 'INTERVIEW' as JobApplicationStatus, 
      icon: 'fa-user-tie', 
      label: 'Interview',
      color: 'warning'
    },
    { 
      status: 'ACCEPTED' as JobApplicationStatus, 
      icon: 'fa-check-double', 
      label: 'Accepted',
      color: 'success'
    },
    { 
      status: 'REJECTED' as JobApplicationStatus, 
      icon: 'fa-times-circle', 
      label: 'Rejected', 
      color: 'danger'
    }
  ];
  constructor(
    private jobService: JobOfferService,
    private jobApplicationService: JobApplicationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.fetchJobOffers();
    const userInfo = this.authService.getUserInfo();
    this.currentUserId = userInfo.idUser;
    this.currentUserEmail = userInfo.email;
  }

  fetchJobOffers() {
    this.loading = true;
    this.jobService.getJobOffers().subscribe({
      next: (data: JobOffer[]) => {
        this.jobOffers = Array.isArray(data) ? data : [];
        this.filteredOffers = [...this.jobOffers];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error fetching job offers';
        console.error('Error details:', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredOffers = this.jobOffers.filter(job => {
      const matchesSearch = this.searchTerm === '' || 
        job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        job.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || 
        (this.statusFilter === 'active' && job.active) || 
        (this.statusFilter === 'inactive' && !job.active);
      
      return matchesSearch && matchesStatus;
    });

    this.sortJobs();
  }

  sortJobs() {
    switch(this.sortOption) {
      case 'newest':
        this.filteredOffers.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'oldest':
        this.filteredOffers.sort((a, b) => 
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case 'title':
        this.filteredOffers.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    let initials = names[0].charAt(0).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].charAt(0).toUpperCase();
    }
    return initials;
  }

  getCreatorName(job: JobOffer): string {
    if (!job.createdBy) return 'Unknown';
    return `${job.createdBy.firstName} ${job.createdBy.lastName}`.trim() || 'Anonymous';
  }

  addJobOffer() {
    if (!this.newJobOffer.title || !this.newJobOffer.description || !this.newJobOffer.requirements) {
      console.error('All fields are required');
      return;
    }

    this.jobService.createJobOffer(this.newJobOffer).subscribe({
      next: (createdJob: JobOffer) => {
        this.jobOffers.unshift(createdJob);
        this.applyFilters();
        this.newJobOffer = { 
          idJobOffer: 0, 
          title: '', 
          description: '', 
          requirements: '', 
          active: true, 
          forumId: 1 
        };
      },
      error: (err) => console.error('Error adding job offer:', err)
    });
  }

  getButtonText(job: JobOffer): string {
    if (this.hasApplied(job.idJobOffer!)) return 'Applied';
    return job.active ? 'Apply Now' : 'Closed';
  }

  getTooltipText(job: JobOffer): string {
    if (!job.active) return 'This position is closed';
    if (this.hasApplied(job.idJobOffer!)) return 'You already applied';
    return 'Apply for this position';
  }

  hasApplied(jobOfferId: number): boolean {
    return !!this.appliedJobs[jobOfferId] || 
      this.jobOffers.some(job => 
        job.idJobOffer === jobOfferId &&
        job.jobApplications?.some(app => 
          app.applicant.idUser === this.currentUserId
        )
      );
  }

  toggleJobStatus(job: JobOffer) {
    const updatedJob = { 
      ...job,
      active: !job.active
    };
  
    this.jobOffers = this.jobOffers.map(j => 
      j.idJobOffer === job.idJobOffer ? updatedJob : j
    );
    this.applyFilters();
  
    this.jobService.updateJobOffer(updatedJob).subscribe({
      error: (err) => {
        console.error('Update failed:', err);
        this.jobOffers = this.jobOffers.map(j => 
          j.idJobOffer === job.idJobOffer ? {...job} : j
        );
        this.applyFilters();
      }
    });
  }

  get openPositionsCount(): number {
    return this.filteredOffers.filter(job => job.active).length;
  }

  isOwnJob(job: JobOffer): boolean {
    return !!this.currentUserId && 
      !!job.createdBy?.idUser && 
      this.currentUserId === job.createdBy.idUser;
  }

  applyForJob(jobOfferId: number) {
    const job = this.jobOffers.find(j => j.idJobOffer === jobOfferId);
    if (this.hasApplied(jobOfferId)) {
      this.openApplicationStatus(jobOfferId);
      return;
    }

    if (job && this.isOwnJob(job)) {
      alert("You cannot apply to your own job post!");
      return;
    }

    if (!this.currentUserEmail) {
      console.error('No email found in token!');
      return;
    }

    this.authService.getUserByEmail(this.currentUserEmail).subscribe({
      next: (applicant: Applicant) => {
        const jobApplication: JobApplication = {
          idApplication: 0,
          applicationDate: new Date(),
          jobApplicationStatus: JobApplicationStatus.PENDING,
          jobOfferId: jobOfferId,
          applicant: applicant,
          statusHistory: [{
            status: JobApplicationStatus.PENDING,
            date: new Date(),
            notes: 'Application submitted'
          }]
        };

        this.jobApplicationService.createJobApplication(jobOfferId, jobApplication).subscribe({
          next: (response: JobApplication) => {
            this.appliedJobs[jobOfferId] = response;
            this.openApplicationStatus(jobOfferId);
          },
          error: (err) => {
            alert(`Error: ${err.error?.message || 'Unknown error occurred'}`);
          }
        });
      },
      error: (err) => {
        alert("Failed to load your user information");
      }
    });
  }

  getAvatarColor(job: JobOffer): string {
    const userId = job.createdBy?.idUser ?? 0;
    return '#' + userId.toString(16).padStart(6, '0');
  }

  openApplicationStatus(jobId: number): void {
    const application = this.getUserApplication(jobId);
    if (application) {
      this.selectedApplication = {
        ...application,
        statusHistory: application.statusHistory || []
      };
      this.showStatusModal = true;
    }
  }
  getNextStatus(currentStatus: JobApplicationStatus): JobApplicationStatus | null {
    const currentIndex = this.statusTimeline.findIndex(s => s.status === currentStatus);
    if (currentIndex === -1 || currentIndex >= this.statusTimeline.length - 1) {
      return null;
    }
    return this.statusTimeline[currentIndex + 1].status;
  }
// Add this method to your component class
getStatusHistory(): any[] {
  return this.selectedApplication?.statusHistory || [];
}
  closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedApplication = null;
  }

  getUserApplication(jobId: number): JobApplication | null {
    return this.appliedJobs[jobId] || 
      this.jobOffers.find(j => j.idJobOffer === jobId)?.jobApplications
        ?.find(app => app.applicant.idUser === this.currentUserId) || null;
  }

  isStatusReached(status: JobApplicationStatus | null): boolean {
    if (!status || !this.selectedApplication) return false;
    const currentIndex = this.statusTimeline.findIndex(s => s.status === this.selectedApplication?.jobApplicationStatus);
    const statusIndex = this.statusTimeline.findIndex(s => s.status === status);
    return statusIndex <= currentIndex;
  }
  getStatusDate(status: JobApplicationStatus | undefined): Date | null {
    if (!status || !this.selectedApplication?.statusHistory) return null;
    const historyItem = this.selectedApplication.statusHistory.find(h => h.status === status);
    return historyItem?.date || null;
  }
  getJobTitle(jobId: number | undefined): string {
    if (!jobId) return '';
    const job = this.jobOffers.find(j => j.idJobOffer === jobId);
    return job?.title || '';
  }

  isLastStatus(status: JobApplicationStatus): boolean {
    return this.statusTimeline[this.statusTimeline.length - 1].status === status;
  }

  getStatusColor(): string {
    if (!this.selectedApplication) return 'secondary';
    switch(this.selectedApplication.jobApplicationStatus) {
      case 'PENDING': return 'secondary';
      case 'UNDER_REVIEW': return 'info';
      case 'INTERVIEW': return 'warning';
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary';
    }
  }
}