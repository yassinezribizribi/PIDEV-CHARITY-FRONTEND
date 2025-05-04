import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';  
import { AssociationService } from '../../../services/association.service';
import { CrisisService, Crisis, CrisisStatus } from '../../../services/crisis.service';
import { PredictionService } from '../../../services/prediction.service';
import { Association, AssociationStatus } from '../../../interfaces/association.interface';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertComponent } from './alert/alert.component';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CrisisDetailDialogComponent } from '@component/crisis-detail-dialog/crisis-detail-dialog.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JobOfferService } from '../../../services/jof-offer.service';
import { JobOffer } from '../../../models/job-offer.model';
import { Chart, registerables } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { RequestService } from 'src/app/services/request.service';
import { Request as MyRequest } from 'src/app/models/Request.model';
import { ResponseService } from 'src/app/services/response.service';
import { Response } from 'src/app/models/Response.model';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';



Chart.register(...registerables);

// Add interface before the component class
interface Activity {
  type: string;
  timestamp: Date;
  description: string;
  severity?: string;
  status?: CrisisStatus;
  reportCount?: number;
  details: any;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterComponent,
    AdminNavbarComponent,
    AlertComponent,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('emailModal') emailModal: any;
  @ViewChild('bulkEmailModal') bulkEmailModal: any;
  @ViewChild('forecastChart') forecastChartRef!: ElementRef;
  
  recipients: string = '';
  
  associations: Association[] = [];
  crises: Crisis[] = [];
  filteredCrises: Crisis[] = [];
  selectedCrisis: Crisis | null = null;
  selectedResourceType: string = '';
  forecastPeriod: number = 14;
  forecast: any[] | null = null;
  urgencyAnalysis: any = null;
  resourceAllocation: any = null;
  routeOptimization: any = null;
  error: string | null = null;
  requests: MyRequest[] = [];
  filteredRequests: MyRequest[] = [];
  searchCrisisTerm: string = '';
  searchRequestTerm: string = '';
  CrisisStatus = CrisisStatus; // Make enum available in template

  readonly dialog = inject(MatDialog);
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
  
  private toastr = inject(ToastrService);
  private sanitizer = inject(DomSanitizer);
  private modalService = inject(NgbModal);
  private forecastChart: Chart | null = null;

  emailForm: FormGroup;
  bulkEmailForm: FormGroup;

  selectedRegion: string = '';
  confidenceInterval: number = 0.95;
  availableGovernorates: string[] = [];
  availableNeedTypes: string[] = [];
  isGeneratingPredictions: boolean = false;
  predictionError: string = '';

  // Add new properties for activity tracking
  recentActivities: Activity[] = [];
  activityTypes = {
    CRISIS_UPDATE: 'crisis_update',
    ASSOCIATION_VERIFY: 'association_verify',
    JOB_REPORT: 'job_report',
    CRISIS_ANALYSIS: 'crisis_analysis'
  };

  constructor(
    private associationService: AssociationService,
    private crisisService: CrisisService,
    private predictionService: PredictionService,
    private jobService: JobOfferService,
    private requestService: RequestService,
    private responseService: ResponseService,
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.emailForm = this.fb.group({
      to: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });

    this.bulkEmailForm = this.fb.group({
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAssociations();
    this.loadCrises();
    this.loadReportedJobs();
    this.loadRequests();
    this.loadAvailableData();
    this.loadRecentActivities();
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
        
        // Add activity
        this.recentActivities.unshift({
          type: this.activityTypes.ASSOCIATION_VERIFY,
          timestamp: new Date(),
          description: `Association "${association.associationName}" verified`,
          details: association
        });
        this.recentActivities = this.recentActivities.slice(0, 5);
      },
      error: (error) => {
        console.error('Error verifying association:', error);
        this.toastr.error('Failed to verify association');
      }
    });
  }

  loadCrises(): void {
    this.crisisService.getAllCrises().subscribe({
      next: (data) => {
        console.log(data)
        this.crises = data;
        this.filteredCrises = [...data];
      },
      error: (err) => {
        console.error('Error fetching crises:', err);
        this.toastr.error('Error loading crises', 'Error');
      }
    });
  }
  loadRequests(): void {
    this.requestService.getAllRequestsWithResponses().subscribe(
      (requests) => {
        this.requests = requests;
        this.filteredRequests = [...requests];
      },
      (error) => {
        console.error('Error loading requests:', error);
      }
    );
  }

  filterCrises() {
    this.filteredCrises = this.crises.filter(crisis => {
      return !this.crisisSearchTerm || 
        crisis.location.toLowerCase().includes(this.crisisSearchTerm.toLowerCase()) ||
        crisis.description.toLowerCase().includes(this.crisisSearchTerm.toLowerCase());
    });
  }

 

  getActivePredictions(): number {
    return this.forecast ? this.forecast.length : 0;
  }

  loadAvailableData() {
    this.http.get<any>('http://localhost:5000/api/flask/predict/resource-allocation')
      .subscribe({
        next: (response) => {
          if (response.available_governorates) {
            this.availableGovernorates = response.available_governorates;
          }
          if (response.available_need_types) {
            this.availableNeedTypes = response.available_need_types;
          }
        },
        error: (error) => {
          console.error('Error loading available data:', error);
          // Set default values if the request fails
          this.availableGovernorates = ['Tunis', 'Sfax', 'Sousse', 'Gabès', 'Nabeul'];
          this.availableNeedTypes = ['Food', 'Medical', 'Shelter', 'Clothing', 'Water'];
          this.toastr.warning('Using default values for available regions and resource types');
        }
      });
  }

  analyzeCrisis() {
    if (!this.selectedCrisis) {
      this.toastr.warning('Please select a crisis to analyze');
      return;
    }

    this.isGeneratingPredictions = true;
    this.predictionError = '';

    // First, get available options
    this.http.get<any>('http://localhost:5000/api/flask/predict/resource-allocation')
      .pipe(
        tap(response => {
          console.log('Available options:', response);
          this.availableGovernorates = response.available_governorates || [];
          this.availableNeedTypes = response.available_need_types || [];
        }),
        catchError(error => {
          console.error('Error getting available options:', error);
          this.toastr.error('Failed to get available options');
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response && this.selectedCrisis) {
            const region = this.selectedCrisis.location.split(',')[0].trim();
            
            // Map crisis category to available resource types
            let resourceType = this.mapCategoryToResourceType(this.selectedCrisis.categorie);
            
            if (!this.availableGovernorates.includes(region)) {
              this.predictionError = `Region "${region}" not available. Available regions: ${this.availableGovernorates.join(', ')}`;
              this.toastr.warning(this.predictionError);
              this.isGeneratingPredictions = false;
              return;
            }

            if (!resourceType) {
              this.predictionError = `No matching resource type found for category "${this.selectedCrisis.categorie}". Available types: ${this.availableNeedTypes.join(', ')}`;
              this.toastr.warning(this.predictionError);
              this.isGeneratingPredictions = false;
              return;
            }

            // Format the date to match your data format
            const crisisDate = new Date(this.selectedCrisis.crisisDate);
            const formattedDate = crisisDate.toISOString().split('T')[0];

            // Create the request data with the exact parameter names expected by the Flask endpoint
            const requestData = {
              region: region,
              resourceType: resourceType,
              date: formattedDate,
              severity: this.selectedCrisis.severity.toLowerCase(),
              description: this.selectedCrisis.description,
              latitude: this.selectedCrisis.latitude,
              longitude: this.selectedCrisis.longitude,
              population: 1000,
              quantity: 100,
              beneficiariesType: 'general_population',
              urgency: this.getUrgencyFromSeverity(this.selectedCrisis.severity),
              crisisType: this.getCrisisTypeFromDescription(this.selectedCrisis.description).toLowerCase().replace(' ', '_'),
              externalDataType: 'none',
              externalEvent: 'none',
              source: 'system'
            };

            console.log('Sending crisis analysis request:', requestData);

            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            });

            this.http.post<any>('http://localhost:5000/api/flask/predict/resource-allocation', requestData, { headers })
              .pipe(
                tap(response => {
                  console.log('Analysis response:', response);
                }),
                catchError(error => {
                  console.error('Error analyzing crisis:', error);
                  if (error.error?.error === 'Insufficient data points') {
                    // Show available regions and resource types for this combination
                    const availableRegions = error.error.available_governorates || [];
                    const availableTypes = error.error.available_need_types || [];
                    
                    // Create a more user-friendly message
                    let message = `Insufficient historical data for ${region} - ${resourceType}.\n\n`;
                    message += 'Please try one of these combinations:\n\n';
                    
                    // Group available combinations by region
                    const regionGroups = new Map<string, string[]>();
                    availableRegions.forEach((region: string) => {
                      regionGroups.set(region, availableTypes);
                    });
                    
                    // Format the message
                    regionGroups.forEach((types, region) => {
                      message += `${region}:\n`;
                      types.forEach(type => {
                        message += `  - ${type}\n`;
                      });
                      message += '\n';
                    });
                    
                    this.predictionError = message;
                    this.toastr.warning('Insufficient data for prediction', 'Warning', {
                      timeOut: 10000,
                      extendedTimeOut: 5000,
                      closeButton: true
                    });
                  } else {
                    this.predictionError = error.error?.error || 'Failed to analyze crisis';
                    this.toastr.error(this.predictionError);
                  }
                  this.forecast = null;
                  this.urgencyAnalysis = null;
                  this.resourceAllocation = null;
                  return of(null);
                })
              )
              .subscribe({
                next: (response) => {
                  if (response && this.selectedCrisis) {
                    this.forecast = response.forecast || [];
                    this.urgencyAnalysis = {
                      crisis_status: response.crisis_status || 'MEDIUM',
                      risk_score: response.risk_score || 50,
                      impact_analysis: response.impact_analysis || {},
                      resource_needs: response.resource_needs || {}
                    };
                    this.resourceAllocation = response.resource_allocation || [];
                    this.error = null;
                    this.toastr.success('Crisis analysis completed successfully');
                    
                    this.recentActivities.unshift({
                      type: this.activityTypes.CRISIS_ANALYSIS,
                      timestamp: new Date(),
                      description: `AI analysis completed for ${this.selectedCrisis.categorie} crisis in ${this.selectedCrisis.location}`,
                      severity: this.selectedCrisis.severity,
                      details: {
                        crisis: this.selectedCrisis,
                        analysis: response
                      }
                    });
                    this.recentActivities = this.recentActivities.slice(0, 5);
                  }
                },
                complete: () => {
                  this.isGeneratingPredictions = false;
                }
              });
          }
        }
      });
  }

  private getUrgencyFromSeverity(severity: string): number {
    switch (severity.toUpperCase()) {
      case 'HIGH': return 5;
      case 'MEDIUM': return 3;
      case 'LOW': return 1;
      default: return 3;
    }
  }

  private getCrisisTypeFromDescription(description: string): string {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('food')) return 'Food insecurity';
    if (lowerDesc.includes('medical')) return 'Health crisis';
    if (lowerDesc.includes('shelter')) return 'Housing crisis';
    if (lowerDesc.includes('water')) return 'Water crisis';
    if (lowerDesc.includes('refugee')) return 'Refugee influx';
    if (lowerDesc.includes('migrant')) return 'Mixed migration';
    return 'General crisis';
  }

  // Helper method to map crisis categories to available resource types
  private mapCategoryToResourceType(category: string): string | null {
    const categoryMap: { [key: string]: string[] } = {
      'FOOD_STORAGE': ['food'],
      'FOOD_DISTRIBUTION': ['food'],
      'FOOD': ['food'],
      'MEDICAL': ['medical aid', 'medical kits'],
      'SHELTER': ['shelter', 'tents'],
      'CLOTHING': ['clothing'],
      'WATER': ['water'],
      'HYGIENE': ['hygiene kits'],
      'RESCUE': ['search and rescue equipment'],
      'EVACUATION': ['evacuation'],
      'BURIAL': ['burial kits'],
      'BLANKETS': ['blankets']
    };

    const normalizedCategory = category.toUpperCase();
    
    // First try exact match (case-insensitive)
    const exactMatch = this.availableNeedTypes.find(type => 
      type.toUpperCase() === normalizedCategory
    );
    if (exactMatch) {
      return exactMatch;
    }

    // Then try mapping
    for (const [key, values] of Object.entries(categoryMap)) {
      if (normalizedCategory.includes(key)) {
        // Find the first matching resource type from the available types
        const matchingType = values.find(type => this.availableNeedTypes.includes(type));
        if (matchingType) {
          return matchingType;
        }
      }
    }

    // If no match found, show available types in the error
    console.log('Available resource types:', this.availableNeedTypes);
    return null;
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
      const date = new Date(item.date);
      return date.toLocaleDateString();
    });

    const yhatData = this.forecast.map(item => item.predicted || 0);
    const upperData = this.forecast.map(item => item.upper || 0);
    const lowerData = this.forecast.map(item => item.lower || 0);

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
        
        // Set the form values
        this.emailForm.patchValue({
          to: email,
          subject: '',
          message: ''
        });
        
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
    if (this.emailForm.valid) {
      const emailData = {
        from: 'admin.admin@gmail.com',
        to: this.emailForm.get('to')?.value,
        subject: this.emailForm.get('subject')?.value,
        content: this.emailForm.get('message')?.value
      };
      
      console.log('Sending email:', emailData);
      this.toastr.success('Email sent successfully!');
      this.modalService.dismissAll();
    } else {
      this.toastr.warning('Please fill in all required fields');
    }
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

    const selectedAssociations = this.associations.filter(a => 
      this.selectedAssociations.includes(a.idAssociation!)
    );

    this.bulkEmailData = {
      subject: '',
      content: ''
    };
    this.selectedTemplate = '';

    // Set the recipients property
    this.recipients = selectedAssociations.map(a => a.associationName).join(', ');

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
    this.toastr.success(`Email sent to ${selectedAssociations.length} associations: ${selectedAssociations.map(a => a.associationName).join(', ')}`);
    this.modalService.dismissAll();
  }

  deleteAssociation(id: number) {
    if (confirm('Are you sure you want to delete this association? This action cannot be undone.')) {
      this.associationService.deleteAssociation(id).subscribe({
        next: () => {
          this.toastr.success('Association deleted successfully');
          // Remove the association from the local list
          this.associations = this.associations.filter(a => a.idAssociation !== id);
          this.filterAssociations();
        },
        error: (error) => {
          console.error('Error deleting association:', error);
          this.toastr.error('Failed to delete association. Please try again.');
        }
      });
    }
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

  

getCrisisCountByStatus(status: CrisisStatus): number {
  return this.crises.filter(c => c.status === status).length;
}

  
    


  filterRequests(): void {
    if (!this.searchRequestTerm) {
      this.filteredRequests = [...this.requests];
      return;
    }
    
    const term = this.searchRequestTerm.toLowerCase();
    this.filteredRequests = this.requests.filter(request => 
      request.object.toLowerCase().includes(term) ||
      request.content.toLowerCase().includes(term)
    );
  }

  deleteCrisis(id?: number): void {
    if (!id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: "To delete the Crisis!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.crisisService.deleteCrisis(id).subscribe({
          next: () => {
            this.toastr.success('Crisis deleted successfully!', 'Success');
            this.loadCrises();
          },
          error: (err) => {
            console.error('Error deleting crisis:', err);
            this.toastr.error('Failed to delete crisis.', 'Error');
          }
        });
      }
    });
  }

  async updateCrisis(crisis: Crisis): Promise<void> {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Crisis',
      html:
        `<div class="mb-3">
          <label class="form-label">Description</label>
          <textarea id="description" class="form-control">${crisis.description}</textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">Severity</label>
          <select id="severity" class="form-select">
            <option value="LOW" ${crisis.severity === 'LOW' ? 'selected' : ''}>LOW</option>
            <option value="MEDIUM" ${crisis.severity === 'MEDIUM' ? 'selected' : ''}>MEDIUM</option>
            <option value="HIGH" ${crisis.severity === 'HIGH' ? 'selected' : ''}>HIGH</option>
          </select>
        </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: () => {
        return {
          description: (document.getElementById('description') as HTMLInputElement).value,
          severity: (document.getElementById('severity') as HTMLSelectElement).value
        };
      }
    });

    if (formValues) {
      const updatedCrisis = {
        ...crisis,
        description: formValues.description,
        severity: formValues.severity
      };

      this.crisisService.updateCrisis(crisis.idCrisis!, updatedCrisis).subscribe({
        next: () => {
          this.toastr.success('Crisis updated successfully', 'Success');
          this.loadCrises();
        },
        error: (err) => {
          console.error('Update error:', err);
          this.toastr.error('Failed to update crisis', 'Error');
        }
      });
    }
  }

  updateStatus(crisis: Crisis): void {
    let newStatus: CrisisStatus;
    
    switch (crisis.status) {
      case CrisisStatus.RESOLVED:
        newStatus = CrisisStatus.PENDING;
        break;
      case CrisisStatus.PENDING:
        newStatus = CrisisStatus.IN_PROGRESS;
        break;
      case CrisisStatus.IN_PROGRESS:
        newStatus = CrisisStatus.RESOLVED;
        break;
      default:
        newStatus = CrisisStatus.PENDING;
    }

    // Optimistic update
    const index = this.crises.findIndex(c => c.idCrisis === crisis.idCrisis);
    if (index !== -1) {
      this.crises[index].status = newStatus;
      this.filterCrises();
      
      // Add activity
      this.recentActivities.unshift({
        type: this.activityTypes.CRISIS_UPDATE,
        timestamp: new Date(),
        description: `Crisis status updated to ${newStatus} in ${crisis.location}`,
        severity: crisis.severity,
        status: newStatus,
        details: crisis
      });
      this.recentActivities = this.recentActivities.slice(0, 5);
    }

    this.crisisService.updateCrisisStatus(crisis.idCrisis!, newStatus).subscribe({
      next: () => {
        this.toastr.success(`Status updated to ${newStatus}`, 'Success');
      },
      error: (err) => {
        console.error('Status update error:', err);
        this.toastr.error('Failed to update status', 'Error');
        // Revert on error
        if (index !== -1) {
          this.crises[index].status = crisis.status;
          this.filterCrises();
        }
      }
    });
  }
  
  viewDetails(crisis: Crisis): void {
    this.selectedCrisis = crisis;
    this.dialog.open(CrisisDetailDialogComponent, {
      data: crisis,
      width: '600px'
    });
  }

  viewRequestDetails(request: MyRequest): void {
    // Implement request detail view as needed
  }

  respondToRequest(request: MyRequest): void {
    Swal.fire({
      title: 'Respond to Request',
      html: `
        <div class="mb-3">
          <label class="form-label">Response</label>
          <textarea id="response" class="form-control" rows="4" placeholder="Enter your response..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Send Response',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const response = (document.getElementById('response') as HTMLTextAreaElement).value;
        if (!response) {
          Swal.showValidationMessage('Please enter a response');
          return false;
        }
        return response;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const response: Response = {
          idResponse: 0, // This will be set by the backend
          dateResponse: new Date(),
          content: result.value,
          object: request.object,
          requestId: request.idRequest,
          senderId: this.authService.getCurrentUser()?.idUser
        };

        this.responseService.addResponse(response, request.idRequest!).subscribe({
          next: () => {
            this.toastr.success('Response sent successfully');
            this.loadRequests(); // Refresh the requests list
          },
          error: (error: Error) => {
            console.error('Error sending response:', error);
            this.toastr.error('Failed to send response');
          }
        });
      }
    });
  }

  exportCrisesToCSV(): void {
    // Implement CSV export functionality
    this.toastr.info('Export functionality coming soon!', 'Info');
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'LOW': return 'badge bg-success';
      case 'MEDIUM': return 'badge bg-warning text-dark';
      case 'HIGH': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'LOW': return 'bi-check-circle';
      case 'MEDIUM': return 'bi-exclamation-triangle';
      case 'HIGH': return 'bi-exclamation-octagon';
      default: return 'bi-question-circle';
    }
  }

  getStatusClass(status: CrisisStatus): string {
    switch (status) {
      case CrisisStatus.PENDING: return 'badge bg-warning text-dark';
      case CrisisStatus.IN_PROGRESS: return 'badge bg-info text-white';
      case CrisisStatus.RESOLVED: return 'badge bg-success text-white';
      default: return 'badge bg-secondary';
    }
  }

  getStatusIcon(status: CrisisStatus): string {
    switch (status) {
      case CrisisStatus.PENDING: return 'bi-hourglass';
      case CrisisStatus.IN_PROGRESS: return 'bi-gear';
      case CrisisStatus.RESOLVED: return 'bi-check-circle';
      default: return 'bi-question-circle';
    }
  }

  getCategoryIcon(category?: string): string {
    if (!category) return 'bi-tag';
    
    switch (category.toLowerCase()) {
      case 'natural': return 'bi-tree';
      case 'medical': return 'bi-heart-pulse';
      case 'conflict': return 'bi-shield-exclamation';
      case 'economic': return 'bi-cash-stack';
      default: return 'bi-tag';
    }
  }

  assignToNearestAssociation(crisis: Crisis): void {
    if (!crisis.idCrisis) {
      this.toastr.warning('Invalid crisis ID');
      return;
    }
  
    this.crisisService.assignCrisisToNearestAssociation(crisis.idCrisis).subscribe({
      next: () => {
        this.toastr.success('Crisis successfully assigned to the nearest approved association.');
        this.loadCrises(); // Refresh list
      },
      error: (err) => {
        console.error('Error assigning crisis:', err);
        if (err.status === 404) {
          this.toastr.error('Crisis not found.');
        } else if (err.status === 400) {
          this.toastr.warning(err.error); // Display backend message (e.g., no association found)
        } else {
          this.toastr.error('Unexpected error assigning crisis.');
        }
      }
    });
  }
  
  onCrisisSelect() {
    if (this.selectedCrisis) {
      this.toastr.info(`Selected crisis: ${this.selectedCrisis.description}`, 'Crisis Selected');
    }
  }

  // Update loadRecentActivities method
  loadRecentActivities() {
    // Combine activities from different sources
    const activities: Activity[] = [];

    // Add crisis updates
    this.crises.forEach(crisis => {
      activities.push({
        type: this.activityTypes.CRISIS_UPDATE,
        timestamp: new Date(crisis.crisisDate || new Date()), // Use crisisDate instead of createdAt
        description: `Crisis reported in ${crisis.location}`,
        severity: crisis.severity,
        status: crisis.status,
        details: crisis
      });
    });

    // Add association verifications
    this.associations.forEach(association => {
      if (association.status === AssociationStatus.APPROVED) {
        activities.push({
          type: this.activityTypes.ASSOCIATION_VERIFY,
          timestamp: new Date(), // You might want to add a verification date to your association model
          description: `Association "${association.associationName}" verified`,
          details: association
        });
      }
    });

    // Add reported jobs
    this.reportedJobs.forEach(job => {
      activities.push({
        type: this.activityTypes.JOB_REPORT,
        timestamp: new Date(job.createdAt),
        description: `Job offer reported: ${job.title}`,
        reportCount: job.reportCount,
        details: job
      });
    });

    // Sort activities by timestamp (most recent first)
    this.recentActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5); // Keep only the 5 most recent activities
  }

  // Add method to get activity icon
  getActivityIcon(activity: any): string {
    switch (activity.type) {
      case this.activityTypes.CRISIS_UPDATE:
        return 'bi-exclamation-triangle';
      case this.activityTypes.ASSOCIATION_VERIFY:
        return 'bi-check-circle';
      case this.activityTypes.JOB_REPORT:
        return 'bi-flag';
      case this.activityTypes.CRISIS_ANALYSIS:
        return 'bi-graph-up';
      default:
        return 'bi-info-circle';
    }
  }

  // Add method to get activity color
  getActivityColor(activity: any): string {
    switch (activity.type) {
      case this.activityTypes.CRISIS_UPDATE:
        return activity.severity === 'HIGH' ? 'text-danger' : 
               activity.severity === 'MEDIUM' ? 'text-warning' : 'text-success';
      case this.activityTypes.ASSOCIATION_VERIFY:
        return 'text-success';
      case this.activityTypes.JOB_REPORT:
        return 'text-danger';
      case this.activityTypes.CRISIS_ANALYSIS:
        return 'text-info';
      default:
        return 'text-secondary';
    }
  }

  // Add method to format activity timestamp
  formatActivityTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  }
}
