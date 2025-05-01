import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';  
import { AssociationService } from '../../../services/association.service';
import { CrisisService, Crisis } from '../../../services/crisis.service';
import { PredictionService } from '../../../services/prediction.service';
import { Association, AssociationStatus } from '../../../interfaces/association.interface';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertComponent } from './alert/alert.component';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JobOfferService } from '../../../services/jof-offer.service';
import { JobOffer } from '../../../models/job-offer.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatDialogModule,
    FooterComponent,
    AdminNavbarComponent,
    AlertComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('emailModal') emailModal: any;
  @ViewChild('bulkEmailModal') bulkEmailModal: any;
  @ViewChild('forecastChart') forecastChartRef!: ElementRef;
  
  associations: Association[] = [];
  crises: Crisis[] = [];
  filteredCrises: Crisis[] = [];
  selectedCrisis: Crisis | null = null;
  selectedResourceType: string = 'food';
  forecastPeriod: number = 14;
  forecast: any[] | null = null;
  urgencyAnalysis: any = null;
  resourceAllocation: any = null;
  routeOptimization: any = null;
  error: string | null = null;
  
  // Search and filter
  crisisSearchTerm: string = '';
  
  // Email contact
  emailData = {
    from: 'admin.admin@gmail.com',
    to: '',
    subject: '',
    content: ''
  };

  // Bulk email data
  bulkEmailData = {
    subject: '',
    content: ''
  };
  selectedTemplate: string = '';
  
  // Associations management properties
  filteredAssociations: Association[] = [];
  searchTerm: string = '';
  statusFilter: string = 'ALL';
  associationLogos: { [id: number]: SafeUrl } = {};
  logoLoadingStates: { [id: number]: boolean } = {};
  defaultLogo = '/assets/images/default-logo.jpg';
  loading = true;
  selectedAssociations: number[] = [];
  
  // Reports properties
  reportedJobs: JobOffer[] = [];
  showJobDetailsModal = false;
  selectedJob: JobOffer | null = null;
  
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private sanitizer = inject(DomSanitizer);
  private modalService = inject(NgbModal);
  private forecastChart: Chart | null = null;

  constructor(
    private associationService: AssociationService,
    private crisisService: CrisisService,
    private predictionService: PredictionService,
    private jobService: JobOfferService
  ) {}

  ngOnInit() {
    this.loadAssociations();
    this.loadCrises();
    this.loadReportedJobs();
  }

  ngAfterViewInit() {
    // Initialize chart when forecast data is available
    if (this.forecast) {
      this.updateForecastChart();
    }
  }

  loadAssociations() {
    this.loading = true;
    this.associationService.getAllAssociations().subscribe({
      next: (associations: Association[]) => {
        this.associations = associations;
        this.filterAssociations();
        // Load logos for each association
        associations.forEach(association => {
          if (association.idAssociation && association.associationLogoPath) {
            this.loadAssociationLogo(association);
          }
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading associations:', error);
        this.toastr.error('Failed to load associations');
        this.loading = false;
      }
    });
  }

  private loadAssociationLogo(association: Association) {
    if (!association.idAssociation || !association.associationLogoPath) return;

    this.logoLoadingStates[association.idAssociation] = true;
    this.associationService.getAssociationLogo(association.associationLogoPath).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.associationLogos[association.idAssociation!] = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.logoLoadingStates[association.idAssociation!] = false;
      },
      error: () => {
        this.associationLogos[association.idAssociation!] = this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
        this.logoLoadingStates[association.idAssociation!] = false;
      }
    });
  }

  getAssociationLogo(association: Association): SafeUrl {
    if (!association?.idAssociation) {
      return this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
    }
    return this.associationLogos[association.idAssociation] || this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
  }

  filterAssociations() {
    this.filteredAssociations = this.associations.filter(a => {
      const matchesSearch = !this.searchTerm || a.associationName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'ALL' || a.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  verifyAssociation(id: number) {
    const association = this.associations.find(a => a.idAssociation === id);
    if (!association) return;

    this.toastr.info('Verifying association...', 'Please wait');
    this.associationService.verifyAssociation(id).subscribe({
      next: () => {
        this.toastr.success('Association verified successfully');
        // Update the status locally
        association.status = AssociationStatus.APPROVED;
        this.filterAssociations();
      },
      error: (error) => {
        console.error('Error verifying association:', error);
        this.toastr.error('Failed to verify association');
      }
    });
  }

  loadCrises() {
    this.crisisService.getAllCrises().subscribe({
      next: (data) => {
        this.crises = data;
        this.filterCrises();
      },
      error: (error) => {
        console.error('Error fetching crises:', error);
        this.toastr.error('Failed to load crises');
      }
    });
  }

  filterCrises() {
    this.filteredCrises = this.crises.filter(crisis => {
      return !this.crisisSearchTerm || 
        crisis.name.toLowerCase().includes(this.crisisSearchTerm.toLowerCase()) ||
        crisis.location.toLowerCase().includes(this.crisisSearchTerm.toLowerCase()) ||
        crisis.description.toLowerCase().includes(this.crisisSearchTerm.toLowerCase());
    });
  }

  getTotalAffectedPeople(): number {
    return this.crises.reduce((total, crisis) => {
      const affected = crisis.affectedPeople || 0;
      return total + affected;
    }, 0);
  }

  getActivePredictions(): number {
    return this.forecast ? this.forecast.length : 0;
  }

  analyzeCrisis(crisis: Crisis) {
    this.selectedCrisis = crisis;
    this.forecast = null;
    this.urgencyAnalysis = null;
    this.resourceAllocation = null;
    this.routeOptimization = null;
    this.error = null;
  }

  generatePredictions() {
    if (!this.selectedCrisis) return;

    this.predictionService.getResourceAllocationPrediction({
      resourceType: this.selectedResourceType,
      region: this.selectedCrisis.location,
      periods: this.forecastPeriod
    }).subscribe({
      next: (response: any) => {
        console.log('Prediction response:', response);
        this.forecast = response.forecast;
        
        // Update urgency analysis with proper formatting
        this.urgencyAnalysis = {
          crisis_status: response.crisis_status || 'Unknown',
          risk_score: parseFloat(response.risk_score) / 100 || 0,
          total_resources_needed: response.total_resources_needed || 0
        };
        
        // Calculate base resources needed
        const baseResources = this.calculateBaseResources(
          this.urgencyAnalysis.risk_score,
          this.selectedResourceType,
          this.forecastPeriod
        );
        
        // Update resource allocation handling
        if (response.resource_distribution_plan && Array.isArray(response.resource_distribution_plan)) {
          this.resourceAllocation = response.resource_distribution_plan.map((item: any) => ({
            location: item.location || 'Unknown',
            resources: this.calculateLocationResources(item, baseResources),
            priority: this.getPriorityLevel(item.priority)
          }));
        } else {
          // Create default resource allocation if none provided
          this.resourceAllocation = [{
            location: this.selectedCrisis?.location || 'Unknown',
            resources: baseResources,
            priority: this.getPriorityLevel(this.urgencyAnalysis.crisis_status)
          }];
        }
        
        this.routeOptimization = response.route_optimization;
        this.error = null;
        this.toastr.success('Analysis completed successfully');
        
        // Update chart after receiving new data
        setTimeout(() => {
          console.log('Updating chart with forecast data:', this.forecast);
          this.updateForecastChart();
        }, 100);
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Failed to generate predictions';
        this.error = errorMessage;
        this.forecast = null;
        this.urgencyAnalysis = null;
        this.resourceAllocation = null;
        this.routeOptimization = null;
        this.toastr.error(errorMessage);
      }
    });
  }

  // Calculate base resources needed based on risk score and resource type
  private calculateBaseResources(riskScore: number, resourceType: string, period: number): number {
    const baseMultiplier = {
      'food': 1000,
      'shelter': 500,
      'medical': 200
    }[resourceType] || 1000;

    const riskMultiplier = riskScore * 2; // Higher risk means more resources
    const periodMultiplier = period / 7; // Scale based on forecast period

    return Math.round(baseMultiplier * riskMultiplier * periodMultiplier);
  }

  // Calculate resources for a specific location
  private calculateLocationResources(item: any, baseResources: number): number {
    const priorityMultiplier = {
      'High': 1.5,
      'Medium': 1.0,
      'Low': 0.5
    }[this.getPriorityLevel(item.priority)] || 1.0;

    return Math.round(baseResources * priorityMultiplier);
  }

  // Helper method to determine priority level
  private getPriorityLevel(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('high') || statusLower.includes('critical')) {
      return 'High';
    } else if (statusLower.includes('medium') || statusLower.includes('moderate')) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  private updateForecastChart() {
    if (!this.forecast || !this.forecastChartRef) {
      console.log('No forecast data or chart reference available');
      return;
    }

    // Destroy existing chart if it exists
    if (this.forecastChart) {
      this.forecastChart.destroy();
    }

    const ctx = this.forecastChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Ensure data is properly formatted
    const labels = this.forecast.map(item => {
      const date = new Date(item.ds);
      return date.toLocaleDateString();
    });

    const yhatData = this.forecast.map(item => item.yhat || 0);
    const upperData = this.forecast.map(item => item.yhat_upper || 0);
    const lowerData = this.forecast.map(item => item.yhat_lower || 0);

    console.log('Chart data:', { labels, yhatData, upperData, lowerData });

    this.forecastChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Predicted Need',
            data: yhatData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            fill: false
          },
          {
            label: 'Upper Bound',
            data: upperData,
            borderColor: 'rgba(75, 192, 192, 0.2)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            borderDash: [5, 5],
            fill: '+1',
            tension: 0.4
          },
          {
            label: 'Lower Bound',
            data: lowerData,
            borderColor: 'rgba(75, 192, 192, 0.2)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            borderDash: [5, 5],
            fill: '-1',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Resource Forecast'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Resources Needed'
            },
            ticks: {
              callback: function(value: string | number) {
                if (typeof value === 'number') {
                  return new Intl.NumberFormat('en-US').format(value);
                }
                return value;
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  openDialog(id: number, enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(AlertComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { id },
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'no' || result === undefined) {
        return;
      }
      this.toastr.success('Crisis deleted successfully');
      this.loadCrises();
    });
  }

  openEmailModal(content: any, association: Association) {
    this.associationService.getUserEmailByAssociationId(association.idAssociation).subscribe({
      next: (email) => {
        this.emailData = {
          from: 'admin.admin@gmail.com',
          to: email,
          subject: '',
          content: ''
        };
        
        this.modalService.open(content, {
          ariaLabelledBy: 'modal-basic-title',
          size: 'lg'
        });
      },
      error: (error) => {
        console.error('Error fetching user email:', error);
        this.toastr.error('Failed to get user email. Please try again.');
      }
    });
  }

  sendEmail() {
    console.log('Sending email:', this.emailData);
    this.toastr.success('Email sent successfully!');
    this.modalService.dismissAll();
  }

  getAssociationsByStatus(status: string): Association[] {
    return this.associations.filter(a => a.status === status);
  }

  toggleSelectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedAssociations = this.filteredAssociations.map(a => a.idAssociation!);
    } else {
      this.selectedAssociations = [];
    }
  }

  toggleAssociationSelection(id: number) {
    const index = this.selectedAssociations.indexOf(id);
    if (index === -1) {
      this.selectedAssociations.push(id);
    } else {
      this.selectedAssociations.splice(index, 1);
    }
  }

  exportAssociations() {
    if (this.selectedAssociations.length === 0) {
      this.toastr.warning('Please select at least one association to export');
      return;
    }

    const selectedAssociations = this.associations.filter(a => 
      this.selectedAssociations.includes(a.idAssociation!)
    );

    const csvContent = this.convertToCSV(selectedAssociations);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `associations_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(associations: Association[]): string {
    const headers = ['ID', 'Name', 'Status', 'Address', 'Phone', 'Email'];
    const rows = associations.map(a => [
      a.idAssociation,
      a.associationName,
      a.status,
      a.associationAddress,
      a.associationPhone,
      a.associationEmail
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  refreshData() {
    this.loading = true;
    this.selectedAssociations = [];
    this.loadAssociations();
  }

  openBulkEmailModal() {
    if (this.selectedAssociations.length === 0) {
      this.toastr.warning('Please select at least one association to send email');
      return;
    }

    this.bulkEmailData = {
      subject: '',
      content: ''
    };
    this.selectedTemplate = '';

    this.modalService.open(this.bulkEmailModal, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg'
    });
  }

  applyTemplate() {
    switch (this.selectedTemplate) {
      case 'verification':
        this.bulkEmailData = {
          subject: 'Verification Request - Association Account',
          content: `Dear Association Representative,

We are reviewing your association's registration. To complete the verification process, please provide the following documents:
1. Valid registration certificate
2. Tax identification number
3. Bank account details

Please submit these documents through your association dashboard.

Best regards,
Admin Team`
        };
        break;
      case 'approval':
        this.bulkEmailData = {
          subject: 'Congratulations! Your Association Has Been Approved',
          content: `Dear Association Representative,

We are pleased to inform you that your association has been approved. You can now access all features of the platform.

Next steps:
1. Complete your association profile
2. Add your team members
3. Start creating missions

Welcome to our community!

Best regards,
Admin Team`
        };
        break;
      case 'rejection':
        this.bulkEmailData = {
          subject: 'Association Registration Update',
          content: `Dear Association Representative,

We regret to inform you that your association registration could not be approved at this time. The following issues were identified:
1. Incomplete documentation
2. Missing required information

Please review and update your registration details. You can reapply after addressing these issues.

Best regards,
Admin Team`
        };
        break;
      case 'update':
        this.bulkEmailData = {
          subject: 'Action Required: Update Association Information',
          content: `Dear Association Representative,

We need you to update some information in your association profile:
1. Current contact details
2. Mission objectives
3. Team members

Please log in to your dashboard and make these updates within 7 days.

Best regards,
Admin Team`
        };
        break;
    }
  }

  sendBulkEmail() {
    if (!this.bulkEmailData.subject || !this.bulkEmailData.content) {
      this.toastr.warning('Please fill in all required fields');
      return;
    }

    const selectedAssociations = this.associations.filter(a => 
      this.selectedAssociations.includes(a.idAssociation!)
    );

    // Here you would typically call your email service to send the emails
    // For now, we'll just show a success message
    this.toastr.success(`Email sent to ${selectedAssociations.length} associations`);
    this.modalService.dismissAll();
  }

  deleteAssociation(id: number) {
    const dialogRef = this.dialog.open(AlertComponent, {
      width: '300px',
      data: { 
        title: 'Delete Association',
        message: 'Are you sure you want to delete this association?',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.associationService.deleteAssociation(id).subscribe({
          next: () => {
            this.toastr.success('Association deleted successfully');
            this.loadAssociations();
          },
          error: (error) => {
            console.error('Error deleting association:', error);
            this.toastr.error('Failed to delete association');
          }
        });
      }
    });
  }

  getAssociationById(id: number): Association | undefined {
    return this.associations.find(a => a.idAssociation === id);
  }

  removeAssociationFromSelection(id: number) {
    const index = this.selectedAssociations.indexOf(id);
    if (index !== -1) {
      this.selectedAssociations.splice(index, 1);
    }
  }

  loadReportedJobs() {
    this.jobService.getJobOffers().subscribe({
      next: (jobs) => {
        this.reportedJobs = jobs.filter(job => job.reportCount > 0);
      },
      error: (err) => {
        console.error('Error loading reported jobs:', err);
        this.toastr.error('Failed to load reported jobs');
      }
    });
  }

  getCreatorName(job: JobOffer): string {
    if (!job.createdBy) return 'Unknown';
    return `${job.createdBy.firstName} ${job.createdBy.lastName}`.trim() || 'Anonymous';
  }

  viewJobDetails(job: JobOffer) {
    this.selectedJob = job;
    this.showJobDetailsModal = true;
  }

  closeJobDetailsModal() {
    this.showJobDetailsModal = false;
    this.selectedJob = null;
  }

  toggleUserBan(job: JobOffer) {
    if (!job.createdBy) return;

    const user = job.createdBy;
    const newBanStatus = !user.isBanned;
    const banReason = newBanStatus ? 'Multiple job offer reports' : null;

    this.jobService.updateUser({
      ...user,
      isBanned: newBanStatus,
      banreason: banReason
    }).subscribe({
      next: () => {
        this.toastr.success(`User ${newBanStatus ? 'banned' : 'unbanned'} successfully`);
        // Update the local state
        user.isBanned = newBanStatus;
        user.banreason = banReason;
        this.loadReportedJobs();
      },
      error: (error: any) => {
        console.error('Error updating user:', error);
        this.toastr.error('Failed to update user status');
      }
    });
  }

  toggleJobStatus(job: JobOffer) {
    job.active = !job.active;
    this.jobService.updateJobOffer(job).subscribe({
      next: () => {
        this.toastr.success(`Job offer ${job.active ? 'reopened' : 'closed'} successfully`);
        this.loadReportedJobs();
      },
      error: (err) => {
        console.error('Error updating job offer:', err);
        this.toastr.error('Failed to update job offer status');
      }
    });
  }
}
