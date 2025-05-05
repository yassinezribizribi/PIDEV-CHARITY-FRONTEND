import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { Directive, ElementRef, Input, OnInit } from '@angular/core';

import { JobOfferService } from '../../../services/jof-offer.service';
import { JobApplicationService } from '../../../services/job-application.service';
import { AuthService } from 'src/app/services/auth.service';

import { JobOffer, JobOfferReport } from '../../../models/job-offer.model';
import { JobApplication, JobApplicationStatus, Applicant, StatusHistory } from '../../../models/job-application.model';

import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';

@Directive({
  selector: 'img[data-token]'
})
export class AuthImageDirective implements OnInit {
  @Input('data-token') token!: string;

  constructor(private el: ElementRef, private authService: AuthService) {}

  ngOnInit() {
    const img = this.el.nativeElement as HTMLImageElement;
    const originalSrc = img.src;
    
    // Create a new image with authentication
    const newImg = new Image();
    newImg.onload = () => {
      img.src = newImg.src;
    };
    newImg.onerror = () => {
      img.src = 'assets/images/default-logo.jpg';
    };

    // Add authentication header
    const xhr = new XMLHttpRequest();
    xhr.open('GET', originalSrc, true);
    xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        newImg.src = URL.createObjectURL(blob);
      } else {
        img.src = 'assets/images/default-logo.jpg';
      }
    };
    
    xhr.onerror = () => {
      img.src = 'assets/images/default-logo.jpg';
    };
    
    xhr.send();
  }
}

@Component({
  selector: 'app-job-opportunities-forum',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-opportunities-forum.component.html',
  styleUrls: ['./job-opportunities-forum.component.scss'],
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent, MatTooltipModule, AuthImageDirective],
  standalone: true,
  providers: [JobOfferService, JobApplicationService]
})
export class JobOpportunitiesForumComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  filteredOffers: JobOffer[] = [];
  currentUserId: number | null = null;
  currentUserEmail: string | null = null;
  currentUser: Applicant | null = null;
  applications: JobApplication[] = [];
  appliedJobs: { [key: number]: JobApplication } = {};
  newJobOffer: JobOffer = { 
    idJobOffer: 0, 
    title: '', 
    description: '', 
    requirements: '', 
    type: 'FULL_TIME',
    active: true, 
    createdAt: new Date(),
    createdBy: {
      idUser: this.currentUserId || 0,
      firstName: '',
      lastName: '',
      photo: null
    },
    reportCount: 0,
    forum: { id: 1, name: 'Job Opportunities' } 
  };
  
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';
  statusFilter: string = 'all';
  sortOption: string = 'newest';
  selectedApplication: JobApplication | null = null;
  showStatusModal = false;
  // Add this to your component class
public JobApplicationStatus = JobApplicationStatus;
  statusTimeline = [
    { 
      status: JobApplicationStatus.PENDING, 
      icon: 'fa-hourglass-start', 
      label: 'Pending',
      color: 'secondary'
    },
    { 
      status: JobApplicationStatus.UNDER_REVIEW, 
      icon: 'fa-search-plus', 
      label: 'Review',
      color: 'info'
    },
    { 
      status: JobApplicationStatus.INTERVIEW, 
      icon: 'fa-user-tie', 
      label: 'Interview',
      color: 'warning'
    },
    { 
      status: JobApplicationStatus.ACCEPTED, 
      icon: 'fa-check-double', 
      label: 'Accepted',
      color: 'success',
      isEndState: true
    },
    { 
      status: JobApplicationStatus.REJECTED, 
      icon: 'fa-times-circle', 
      label: 'Rejected', 
      color: 'danger',
      isEndState: true
    }
  ];

  // Reporting properties
  showReportModal = false;
  selectedJobForReport: JobOffer | null = null;
  reportError: string | null = null;
  reportSuccess = false;
  reportCounts: { [key: number]: number } = {};

  // Inappropriate words list
  private inappropriateWords = [
    'fuck', 'shit', 'bitch', 'damn', 'hell',
    'sex', 'drugs', 'alcohol', 'weapon', 'death',
    'hate', 'racist', 'nazi', 'terrorist', 'bomb', 'gun'
  ];

  // Validation patterns
  private readonly titlePattern = /^[a-zA-Z0-9\s\-.,!?()]{5,100}$/;
  private readonly descriptionPattern = /^[a-zA-Z0-9\s\-.,!?()]{20,1000}$/;
  private readonly requirementsPattern = /^[a-zA-Z0-9\s\-.,!?()]{10,500}$/;

  // Validation states
  titleError: string | null = null;
  descriptionError: string | null = null;
  requirementsError: string | null = null;
  inappropriateWordsFound: string[] = [];

  // Add these properties
  suggestedJobs: JobOffer[] = [];
  showSuggestions: boolean = false;
  currentUserJob: string | null = null;

  userProfileImages: { [key: number]: string } = {};
  userImageLoadingStates: { [key: number]: boolean } = {};
  defaultUserImage = 'assets/images/default-logo.jpg';

  constructor(
    private jobService: JobOfferService,
    private jobApplicationService: JobApplicationService,
    public authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchJobOffers();
    const userInfo = this.authService.getUserInfo();
    this.currentUserId = userInfo.idUser;
    this.currentUserEmail = userInfo.email;

    if (this.currentUserEmail) {
      this.authService.getUserByEmail(this.currentUserEmail).subscribe({
        next: (user) => {
          this.currentUser = user;
          
          // Try to get job from different possible locations in user data
          const possibleJobs = [
            user.job,
            user.profession,
            user.occupation,
            user.initialJob,
            user.role
          ].filter((job): job is string => 
            typeof job === 'string' && job !== 'REFUGEE'
          );
          
          this.currentUserJob = possibleJobs.length > 0 ? possibleJobs[0] : null;
          
          // Load job applications after getting user info
          if (this.currentUserId) {
            this.loadJobApplications(this.currentUserId);
          }
        },
        error: (err) => {
          console.error('Error loading user info:', err);
        }
      });
    }

    // Check for rejected applications every minute
    setInterval(() => this.checkAndDeleteRejectedApplications(), 60000);
  }

  fetchJobOffers() {
    this.loading = true;
    this.jobService.getJobOffers().subscribe({
      next: (offers: JobOffer[]) => {
        console.log('Fetched job offers:', offers);
        this.jobOffers = offers;
        this.filteredOffers = [...offers];
        
        // Load profile images for each job creator
        this.jobOffers.forEach(job => {
          if (job.createdBy?.idUser) {
            // Get the profile image using the auth service
            this.authService.getProfileImage(job.createdBy.idUser).subscribe({
              next: (imageUrl: string | null) => {
                if (imageUrl) {
                  this.userProfileImages[job.createdBy!.idUser] = imageUrl;
                  this.cdr.detectChanges();
                } else {
                  this.userProfileImages[job.createdBy!.idUser] = this.defaultUserImage;
                  this.cdr.detectChanges();
                }
              },
              error: (error: any) => {
                console.error('Error loading profile image:', error);
                this.userProfileImages[job.createdBy!.idUser] = this.defaultUserImage;
                this.cdr.detectChanges();
              }
            });
          }
        });
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error fetching job offers:', err);
        this.error = 'Failed to load job offers';
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

  validateJobOffer(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate title
    if (!this.titlePattern.test(this.newJobOffer.title)) {
      errors.push('Title must be between 5 and 100 characters and contain only letters, numbers, and basic punctuation.');
    }

    // Validate description
    if (!this.descriptionPattern.test(this.newJobOffer.description)) {
      errors.push('Description must be between 20 and 1000 characters and contain only letters, numbers, and basic punctuation.');
    }

    // Validate requirements
    if (!this.requirementsPattern.test(this.newJobOffer.requirements)) {
      errors.push('Requirements must be between 10 and 500 characters and contain only letters, numbers, and basic punctuation.');
    }

    // Check for inappropriate words
    const allText = `${this.newJobOffer.title} ${this.newJobOffer.description} ${this.newJobOffer.requirements}`.toLowerCase();
    const foundInappropriateWords = this.inappropriateWords.filter(word => 
      allText.includes(word.toLowerCase())
    );

    if (foundInappropriateWords.length > 0) {
      errors.push(`Inappropriate content detected. Please remove: ${foundInappropriateWords.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  addJobOffer() {
    if (!this.newJobOffer.title || !this.newJobOffer.description || !this.newJobOffer.requirements) {
      console.error('All fields are required');
      return;
    }

    // Validate content
    const validation = this.validateJobOffer();
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    if (this.currentUser?.isBanned) {
      alert("Your account has been banned. You cannot post new job offers.");
      return;
    }

    if (!this.currentUserId) {
      alert("You must be logged in to post a job offer.");
      return;
    }

    // Create a new job offer with only required fields
    const jobOfferToCreate = {
      title: this.newJobOffer.title,
      description: this.newJobOffer.description,
      requirements: this.newJobOffer.requirements,
      active: true,
      createdAt: new Date().toISOString(),
      createdById: this.currentUserId,
      forumId: 1
    };

    console.log('Creating job offer:', jobOfferToCreate);

    this.jobService.createJobOffer(jobOfferToCreate).subscribe({
      next: (createdJob: JobOffer) => {
        this.jobOffers.unshift(createdJob);
        this.applyFilters();
        // Reset the form
        this.newJobOffer = { 
          title: '', 
          description: '', 
          requirements: '', 
          active: true, 
          createdAt: new Date().toISOString(),
          createdBy: {
            idUser: this.currentUserId || 0,
            firstName: '',
            lastName: '',
            photo: null,
            isBanned: false,
            banreason: null
          },
          reportCount: 0,
          forum: { id: 1, name: 'Job Opportunities' } 
        };
      },
      error: (err) => {
        console.error('Error adding job offer:', err);
        alert('Failed to create job offer. Please try again.');
      }
    });
  }

  getButtonText(job: JobOffer): string {
    if (this.hasApplied(job.idJobOffer!)) return 'Applied';
    if (this.currentUser?.isBanned) return 'Account Banned';
    return job.active ? 'Apply Now' : 'Closed';
  }

  getTooltipText(job: JobOffer): string {
    if (!job.active) return 'This position is closed';
    if (this.hasApplied(job.idJobOffer!)) return 'You already applied';
    if (this.currentUser?.isBanned) return 'Your account has been banned';
    return 'Apply for this position';
  }

  hasApplied(jobOfferId: number): boolean {
    // First check appliedJobs as it's the fastest
    if (this.appliedJobs[jobOfferId]) {
      return true;
    }
    
    // Then check the current job in filteredOffers (which is what's displayed)
    const filteredJob = this.filteredOffers.find(j => j.idJobOffer === jobOfferId);
    if (filteredJob?.jobApplications?.some(app => app.applicant?.idUser === this.currentUserId)) {
      return true;
    }

    return false;
  }

  toggleJobStatus(job: JobOffer) {
    if (this.currentUser?.isBanned) {
      alert("Your account has been banned. You cannot modify job offers.");
      return;
    }

    job.active = !job.active;
    this.jobService.updateJobOffer(job).subscribe({
      next: () => {
        this.toastr.success(`Job offer ${job.active ? 'reopened' : 'closed'} successfully`);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error updating job offer:', err);
        this.toastr.error('Failed to update job offer status');
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

  applyForJob(jobId: number): void {
    if (!this.currentUserId) {
      this.toastr.warning('Please log in to apply for jobs');
      return;
    }

    if (this.currentUser?.isBanned) {
      this.toastr.error('Your account has been banned. You cannot apply for jobs.');
      return;
    }

    const job = this.jobOffers.find(j => j.idJobOffer === jobId);
    if (!job || !job.active) {
      this.toastr.error('This position is no longer available');
      return;
    }

    const jobApplication: JobApplication = {
      idApplication: 0,
      applicationDate: new Date(),
      jobApplicationStatus: JobApplicationStatus.PENDING,
      jobOfferId: jobId,
      applicant: this.currentUser!,
      statusHistory: [{
        status: JobApplicationStatus.PENDING,
        date: new Date(),
        notes: 'Application submitted'
      }]
    };

    this.jobApplicationService.createJobApplication(jobId, jobApplication).subscribe({
      next: (response: JobApplication) => {
        this.toastr.success('Application submitted successfully');
        // Refresh applications after applying
        this.loadJobApplications(this.currentUserId!);
      },
      error: (err: any) => {
        this.toastr.error('Error submitting application');
        console.error('Error details:', err);
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

  getNextStatus(currentStatus: JobApplicationStatus | undefined): JobApplicationStatus {
    const mainStatusOrder = [
      JobApplicationStatus.PENDING,
      JobApplicationStatus.UNDER_REVIEW,
      JobApplicationStatus.INTERVIEW
    ];

    if (!currentStatus) return JobApplicationStatus.PENDING;
    
    const currentIndex = mainStatusOrder.indexOf(currentStatus);
    if (currentIndex < mainStatusOrder.length - 1) {
      return mainStatusOrder[currentIndex + 1];
    }
    return currentStatus; // Stay at INTERVIEW until either ACCEPTED or REJECTED
  }

  getStatusHistory(): StatusHistory[] {
    return this.selectedApplication?.statusHistory || [];
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedApplication = null;
  }

  getUserApplication(jobId?: number): JobApplication | undefined {
    if (jobId) {
      return this.appliedJobs[jobId] || 
        this.jobOffers.find(j => j.idJobOffer === jobId)?.jobApplications
          ?.find(app => app.applicant?.idUser === this.currentUserId);
    }
    return Object.values(this.appliedJobs).find(app => 
      app.applicant?.idUser === this.currentUserId
    );
  }

  isStatusReached(status: JobApplicationStatus): boolean {
    if (!this.selectedApplication) return false;
  
    const finalStatus = this.selectedApplication.jobApplicationStatus || JobApplicationStatus.PENDING;
    
    // Main progression path
    const mainStatusOrder = [
      JobApplicationStatus.PENDING,
      JobApplicationStatus.UNDER_REVIEW,
      JobApplicationStatus.INTERVIEW
    ];

    // If we're checking an end state (ACCEPTED or REJECTED)
    if (status === JobApplicationStatus.ACCEPTED || status === JobApplicationStatus.REJECTED) {
      // Only show this end state if it matches the final status
      return status === finalStatus;
    }

    // For main progression statuses
    if (mainStatusOrder.includes(status)) {
      // If we're in an end state, show all main progression
      if (finalStatus === JobApplicationStatus.ACCEPTED || finalStatus === JobApplicationStatus.REJECTED) {
        return true;
      }
      // Otherwise, show up to current status
      return mainStatusOrder.indexOf(status) <= mainStatusOrder.indexOf(finalStatus);
    }

    return false;
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

  hasUserApplied(): boolean {
    return Object.values(this.appliedJobs).some(app => 
      app.applicant?.idUser === this.currentUserId
    );
  }

  // Add this helper method to determine which statuses to show in the timeline
  getVisibleStatuses() {
    return this.statusTimeline.filter(status => {
      // Always show main progression statuses
      if ([JobApplicationStatus.PENDING, JobApplicationStatus.UNDER_REVIEW, JobApplicationStatus.INTERVIEW].includes(status.status)) {
        return true;
      }
      
      // For end states, only show if it matches the current status
      if (status.isEndState) {
        return this.selectedApplication?.jobApplicationStatus === status.status;
      }
      
      return false;
    });
  }

  withdrawApplication(applicationId: number) {
    if (confirm('Are you sure you want to withdraw your application? This action cannot be undone.')) {
      const jobOfferId = this.selectedApplication?.jobOfferId;
      
      // Close modal immediately after confirmation
      this.showStatusModal = false;
      this.selectedApplication = null;

      // Immediately update the UI state
      if (jobOfferId) {
        // Remove from appliedJobs immediately
        delete this.appliedJobs[jobOfferId];
        
        // Update jobOffers immediately
        this.jobOffers = this.jobOffers.map(job => {
          if (job.idJobOffer === jobOfferId) {
            return {
              ...job,
              jobApplications: job.jobApplications?.filter(app => 
                app.idApplication !== applicationId
              )
            };
          }
          return job;
        });

        // Update filteredOffers immediately
        this.filteredOffers = this.filteredOffers.map(job => {
          if (job.idJobOffer === jobOfferId) {
            return {
              ...job,
              jobApplications: job.jobApplications?.filter(app => 
                app.idApplication !== applicationId
              )
            };
          }
          return job;
        });
      }

      // Then send the request to the server
      this.jobApplicationService.deleteJobApplication(applicationId).subscribe({
        next: () => {
          // State is already updated, no need to do anything here
        },
        error: (err) => {
          console.error('Error withdrawing application:', err);
          alert('Failed to withdraw application. Please try again.');
          
          // If error occurs, restore the application state
          if (jobOfferId && this.selectedApplication) {
            this.appliedJobs[jobOfferId] = this.selectedApplication;
            
            // Restore the application in the lists
            this.jobOffers = this.jobOffers.map(job => {
              if (job.idJobOffer === jobOfferId && this.selectedApplication) {
                return {
                  ...job,
                  jobApplications: [...(job.jobApplications || []), this.selectedApplication]
                };
              }
              return job;
            });

            this.filteredOffers = this.filteredOffers.map(job => {
              if (job.idJobOffer === jobOfferId && this.selectedApplication) {
                return {
                  ...job,
                  jobApplications: [...(job.jobApplications || []), this.selectedApplication]
                };
              }
              return job;
            });
          }
        }
      });
    }
  }

  shouldDeleteRejectedApplication(application: JobApplication): boolean {
    if (application.jobApplicationStatus !== JobApplicationStatus.REJECTED) {
      return false;
    }

    // Get the rejection date from status history
    const rejectionEntry = application.statusHistory?.find(
      history => history.status === JobApplicationStatus.REJECTED
    );

    if (!rejectionEntry || !rejectionEntry.date) {
      return false;
    }

    // Calculate time difference
    const rejectionTime = new Date(rejectionEntry.date).getTime();
    const currentTime = new Date().getTime();
    const hourInMillis = 60 * 60 * 1000;

    return (currentTime - rejectionTime) >= hourInMillis;
  }

  checkAndDeleteRejectedApplications() {
    Object.values(this.appliedJobs).forEach(application => {
      if (this.shouldDeleteRejectedApplication(application)) {
        this.jobApplicationService.deleteJobApplication(application.idApplication!).subscribe({
          next: () => {
            delete this.appliedJobs[application.jobOfferId!];
            if (this.selectedApplication?.idApplication === application.idApplication) {
              this.closeStatusModal();
            }
          },
          error: (err) => console.error('Error deleting rejected application:', err)
        });
      }
    });
  }

  openReportModal(job: JobOffer) {
    if (this.currentUser?.isBanned) {
      alert("Your account has been banned. You cannot report job offers.");
      return;
    }

    this.selectedJobForReport = job;
    this.showReportModal = true;
    this.reportError = null;
    this.reportSuccess = false;
  }

  closeReportModal() {
    this.showReportModal = false;
    this.selectedJobForReport = null;
    this.reportError = null;
    this.reportSuccess = false;
  }

  submitReport() {
    if (!this.selectedJobForReport || !this.currentUserId) {
      this.reportError = 'Invalid report data';
      return;
    }

    this.jobService.reportJobOffer(
      this.selectedJobForReport.idJobOffer!,
      this.currentUserId
    ).subscribe({
      next: (response) => {
        this.reportSuccess = true;
        // Update report count
        if (this.selectedJobForReport?.idJobOffer) {
          this.reportCounts[this.selectedJobForReport.idJobOffer] = 
            (this.reportCounts[this.selectedJobForReport.idJobOffer] || 0) + 1;
        }
        setTimeout(() => {
          this.closeReportModal();
        }, 2000);
      },
      error: (err) => {
        console.error('Error submitting report:', err);
        this.reportError = err.error?.message || 'Failed to submit report';
      }
    });
  }

  getReportCount(jobId: number): number {
    return this.reportCounts[jobId] || 0;
  }

  validateTitle(title: string): void {
    if (!title) {
      this.titleError = 'Title is required';
      return;
    }
    if (!this.titlePattern.test(title)) {
      this.titleError = 'Title must be between 5 and 100 characters and contain only letters, numbers, and basic punctuation';
      return;
    }
    this.titleError = null;
    this.checkInappropriateWords();
  }

  validateDescription(description: string): void {
    if (!description) {
      this.descriptionError = 'Description is required';
      return;
    }
    if (!this.descriptionPattern.test(description)) {
      this.descriptionError = 'Description must be between 20 and 1000 characters and contain only letters, numbers, and basic punctuation';
      return;
    }
    this.descriptionError = null;
    this.checkInappropriateWords();
  }

  validateRequirements(requirements: string): void {
    if (!requirements) {
      this.requirementsError = 'Requirements are required';
      return;
    }
    if (!this.requirementsPattern.test(requirements)) {
      this.requirementsError = 'Requirements must be between 10 and 500 characters and contain only letters, numbers, and basic punctuation';
      return;
    }
    this.requirementsError = null;
    this.checkInappropriateWords();
  }

  private checkInappropriateWords(): void {
    const allText = `${this.newJobOffer.title} ${this.newJobOffer.description} ${this.newJobOffer.requirements}`.toLowerCase();
    this.inappropriateWordsFound = this.inappropriateWords.filter(word => 
      allText.includes(word.toLowerCase())
    );
  }

  isFormValid(): boolean {
    return !this.titleError && 
           !this.descriptionError && 
           !this.requirementsError && 
           this.inappropriateWordsFound.length === 0;
  }

  // Add this method to analyze job interests
  private analyzeJobInterests(): string[] {
    const interests: { [key: string]: number } = {};
    
    // Analyze titles and descriptions of applied jobs
    this.applications.forEach(app => {
      const job = this.jobOffers.find(j => j.idJobOffer === app.jobOfferId);
      if (job) {
        // Extract keywords from title (highest weight)
        const titleWords = job.title.toLowerCase().split(/\s+/);
        titleWords.forEach(word => {
          if (word.length > 3 && !this.isCommonWord(word)) { // Ignore short words and common words
            interests[word] = (interests[word] || 0) + 3; // Give highest weight to titles
          }
        });

        // Extract keywords from requirements (second highest weight)
        const reqWords = job.requirements.toLowerCase().split(/[,\n]+/);
        reqWords.forEach(req => {
          const words = req.trim().split(/\s+/);
          words.forEach(word => {
            if (word.length > 3 && !this.isCommonWord(word)) {
              interests[word] = (interests[word] || 0) + 2; // Give high weight to requirements
            }
          });
        });

        // Extract keywords from description (lowest weight)
        const descWords = job.description.toLowerCase().split(/\s+/);
        descWords.forEach(word => {
          if (word.length > 3 && !this.isCommonWord(word)) {
            interests[word] = (interests[word] || 0) + 1;
          }
        });
      }
    });

    // Sort interests by frequency and return top keywords
    const result = Object.entries(interests)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
      
    return result;
  }

  // Helper method to check if a word is too common to be meaningful
  private isCommonWord(word: string): boolean {
    const commonWords = [
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'will', 'would',
      'should', 'could', 'must', 'need', 'want', 'like', 'good', 'great', 'best',
      'work', 'job', 'position', 'role', 'team', 'company', 'organization', 'project',
      'experience', 'skills', 'ability', 'knowledge', 'required', 'preferred', 'looking',
      'seeking', 'opportunity', 'chance', 'join', 'become', 'part', 'help', 'support',
      'assist', 'provide', 'ensure', 'maintain', 'develop', 'create', 'manage', 'lead',
      'coordinate', 'implement', 'execute', 'perform', 'handle', 'process', 'review',
      'analyze', 'evaluate', 'assess', 'identify', 'solve', 'resolve', 'improve',
      'enhance', 'optimize', 'maximize', 'minimize', 'reduce', 'increase', 'decrease',
      'maintain', 'ensure', 'verify', 'validate', 'confirm', 'check', 'monitor',
      'track', 'report', 'document', 'record', 'maintain', 'update', 'modify',
      'change', 'adjust', 'adapt', 'modify', 'revise', 'review', 'edit', 'correct',
      'fix', 'repair', 'resolve', 'address', 'handle', 'manage', 'deal', 'cope',
      'handle', 'manage', 'deal', 'cope', 'handle', 'manage', 'deal', 'cope'
    ];
    return commonWords.includes(word.toLowerCase());
  }

  // Add this method to find similar jobs
  private findSimilarJobs(keywords: string[]): JobOffer[] {
    return this.jobOffers
      .filter(job => {
        // Skip jobs the user has already applied to
        if (this.hasApplied(job.idJobOffer!)) {
          return false;
        }
        
        // Skip jobs created by the current user
        if (this.isOwnJob(job)) {
          return false;
        }
        
        // Skip inactive jobs
        if (!job.active) {
          return false;
        }

        // Get the user's current job
        const userJob = this.currentUserJob?.toLowerCase() || '';
        
        // Define job categories and their related skills
        const jobCategories = {
          'hairdresser': ['styling', 'customer service', 'beauty', 'salon', 'hair', 'stylist', 'beautician', 'client', 'appointment', 'service'],
          'teacher': ['education', 'teaching', 'classroom', 'student', 'learning', 'instruction', 'communication', 'organization', 'planning'],
          'nurse': ['healthcare', 'medical', 'patient care', 'hospital', 'clinic', 'health', 'care', 'support', 'assistance'],
          'chef': ['cooking', 'kitchen', 'food', 'restaurant', 'culinary', 'cooking', 'preparation', 'service', 'quality'],
          'driver': ['transportation', 'delivery', 'logistics', 'driving', 'vehicle', 'safety', 'schedule', 'route'],
          'cleaner': ['cleaning', 'maintenance', 'janitorial', 'housekeeping', 'sanitation', 'organization', 'attention to detail'],
          'construction': ['building', 'construction', 'labor', 'contractor', 'carpentry', 'physical', 'teamwork', 'safety'],
          'retail': ['sales', 'customer service', 'retail', 'store', 'merchandise', 'inventory', 'cashier', 'assistance'],
          'office': ['administration', 'office', 'clerical', 'reception', 'secretary', 'organization', 'communication', 'computer'],
          'it': ['technology', 'computer', 'software', 'programming', 'development', 'technical', 'problem-solving', 'analysis']
        };

        // Get related skills for the user's job
        const relatedSkills = jobCategories[userJob as keyof typeof jobCategories] || [];
        
        // Calculate similarity score with weighted matching
        let score = 0;
        const matches: { keyword: string; location: string; score: number }[] = [];
        
        // Check if the job title or description contains any of the related skills
        const jobText = `${job.title} ${job.description} ${job.requirements}`.toLowerCase();
        
        // Count how many related skills are found in the job
        const foundSkills = relatedSkills.filter(skill => jobText.includes(skill));
        const skillMatchCount = foundSkills.length;
        
        // If no related skills found, check for general transferable skills
        if (skillMatchCount === 0) {
          const transferableSkills = [
            'communication', 'teamwork', 'organization', 'time management',
            'problem solving', 'customer service', 'attention to detail',
            'adaptability', 'responsibility', 'initiative'
          ];
          
          const foundTransferableSkills = transferableSkills.filter(skill => jobText.includes(skill));
          if (foundTransferableSkills.length > 0) {
            score += foundTransferableSkills.length;
            matches.push({ 
              keyword: foundTransferableSkills.join(', '), 
              location: 'transferable skills', 
              score: foundTransferableSkills.length 
            });
          }
        } else {
          // Add score based on number of related skills found
          score += skillMatchCount * 2;
          matches.push({ 
            keyword: foundSkills.join(', '), 
            location: 'related skills', 
            score: skillMatchCount * 2 
          });
        }

        // Check title matches (highest weight)
        if (job.title) {
          const titleWords = job.title.toLowerCase().split(/\s+/);
          keywords.forEach(keyword => {
            if (titleWords.some(word => word.includes(keyword))) {
              score += 2;
              matches.push({ keyword, location: 'title', score: 2 });
            }
          });
        }
        
        // Check requirements matches (second highest weight)
        if (job.requirements) {
          const reqWords = job.requirements.toLowerCase().split(/[,\n]+/);
          keywords.forEach(keyword => {
            if (reqWords.some(req => req.includes(keyword))) {
              score += 1.5;
              matches.push({ keyword, location: 'requirements', score: 1.5 });
            }
          });
        }
        
        // Check description matches (lowest weight)
        if (job.description) {
          const descWords = job.description.toLowerCase().split(/\s+/);
          keywords.forEach(keyword => {
            if (descWords.some(word => word.includes(keyword))) {
              score += 1;
              matches.push({ keyword, location: 'description', score: 1 });
            }
          });
        }
        
        if (score > 0) {
          // Store the matches in the job object for later use
          (job as any).suggestionMatches = matches;
          (job as any).suggestionScore = score;
        }
        return score > 0;
      })
      .sort((a, b) => {
        const aScore = (a as any).suggestionScore || 0;
        const bScore = (b as any).suggestionScore || 0;
        return bScore - aScore;
      })
      .slice(0, 3); // Return top 3 matches
  }

  // Add this method to get the suggestion report
  getSuggestionReport(job: JobOffer): string {
    const matches = (job as any).suggestionMatches || [];
    
    if (!this.currentUser || !this.currentUserJob) {
      return 'This position could be a good match for your skills and experience.';
    }

    const report = [];
    
    // Start with context about their job
    report.push(`Based on your experience as a ${this.currentUserJob}, this position could be a good match for your skills.`);
    
    // Group matches by location
    const titleMatches = matches.filter((m: { location: string }) => m.location === 'title');
    const reqMatches = matches.filter((m: { location: string }) => m.location === 'requirements');
    const descMatches = matches.filter((m: { location: string }) => m.location === 'description');
    
    // Filter out common words and meaningless matches
    const filterMeaningfulMatches = (matches: any[]) => {
      return matches.filter(m => {
        const keyword = m.keyword.toLowerCase();
        return !['plus', 'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(keyword) 
               && keyword.length > 3;
      });
    };

    const meaningfulTitleMatches = filterMeaningfulMatches(titleMatches);
    const meaningfulReqMatches = filterMeaningfulMatches(reqMatches);
    const meaningfulDescMatches = filterMeaningfulMatches(descMatches);

    // Add specific matches with context of their job
    if (meaningfulTitleMatches.length > 0) {
      const keywords = meaningfulTitleMatches.map((m: { keyword: string }) => m.keyword).join(', ');
      report.push(`Your experience as a ${this.currentUserJob} aligns well with the required skills in ${keywords}.`);
    }
    
    if (meaningfulReqMatches.length > 0) {
      const keywords = meaningfulReqMatches.map((m: { keyword: string }) => m.keyword).join(', ');
      report.push(`The requirements include ${keywords}, which complement your background as a ${this.currentUserJob}.`);
    }
    
    if (meaningfulDescMatches.length > 0) {
      const keywords = meaningfulDescMatches.map((m: { keyword: string }) => m.keyword).join(', ');
      report.push(`The job involves ${keywords}, which could build upon your experience as a ${this.currentUserJob}.`);
    }

    // Add context about job type
    if (job.type === 'FULL_TIME') {
      report.push(`This full-time position could help you establish yourself in your field.`);
    } else if (job.type === 'PART_TIME') {
      report.push(`This part-time role could offer flexibility while you continue to build your career.`);
    }

    // Add closing statement
    if (this.currentUser.isBanned) {
      report.push(`Note: Your account is currently restricted. Please contact support for assistance.`);
    } else {
      report.push(`This opportunity could help you continue your career path as a ${this.currentUserJob}.`);
    }
    
    return report.join(' ');
  }

  // Add this method to show suggestions
  showJobSuggestions(): void {
    if (!this.currentUserId) {
      this.toastr.warning('Please log in to see job suggestions');
      return;
    }

    if (this.applications.length === 0) {
      this.toastr.info('We need more information about your interests. Please apply to some jobs first!');
      return;
    }
    
    this.suggestedJobs = this.findSimilarJobs(this.analyzeJobInterests());
    this.showSuggestions = true;
    this.cdr.detectChanges();
  }

  // Update the loadJobApplications method
  loadJobApplications(userId: number) {
    this.jobApplicationService.getCurrentUserApplications()
      .subscribe({
        next: (applications: JobApplication[]) => {
          this.applications = applications;
          // Update appliedJobs map
          applications.forEach(app => {
            if (app.jobOfferId) {
              this.appliedJobs[app.jobOfferId] = app;
            }
          });
          this.loading = false;
          this.cdr.detectChanges();
          
          // After loading applications, update suggestions
          if (this.applications.length > 0) {
            this.suggestedJobs = this.findSimilarJobs(this.analyzeJobInterests());
          }
        },
        error: (err: any) => {
          console.error('Error fetching applications:', err);
          this.loading = false;
        }
      });
  }

  getUserProfileImage(userId: number | undefined): string {
    if (!userId) {
      return this.defaultUserImage;
    }
    return this.userProfileImages[userId] || this.defaultUserImage;
  }

  handleImageError(userId: number | undefined): void {
    if (userId) {
      this.userProfileImages[userId] = this.defaultUserImage;
      this.cdr.detectChanges();
    }
  }

  isUserImageLoading(userId: number | undefined): boolean {
    return false;
  }
}