import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AssociationService } from '../../services/association.service';
import { AidService } from '../../services/aid.service';
import { EventService } from '../../services/event.service';
import { ModalService } from '../../services/modal.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { Association, AssociationStatus } from '../../interfaces/association.interface';
import { TndPipe } from '../../shared/pipes/tnd.pipe';
import { AdminNavbarComponent } from '../admin/admin-navbar/admin-navbar.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Donation } from 'src/app/interfaces/donation.interface';
import { Mission } from 'src/app/interfaces/mission.interface';
import { AssociationDonationService } from '../../services/association-donation.service';
import { MissionService } from '../../services/mission.service';
import { FormsModule } from '@angular/forms';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

interface Activity {
  id: string;
  type: 'donation' | 'case' | 'event' | 'member' | 'mission';
  title: string;
  description: string;
  date: Date;
}

interface PartnerAssociation extends Association {
  partnershipId?: number;
}

@Component({
  selector: 'app-association-account',
  standalone: true,
  imports: [
    CommonModule,
    TimeAgoPipe,
    ModalComponent,
    TndPipe,
    AdminNavbarComponent,
    RouterLink,
    NgbTooltip,
    FormsModule
  ],
  templateUrl: './association-account.component.html',
  styleUrls: ['./association-account.component.scss']
})
export class AssociationAccountComponent implements OnInit {
  AssociationStatus = AssociationStatus;
  association: Association | null = null;
  loading = true;
  error: string | null = null;
  imageUrl: SafeUrl | null = null;
  donations: Donation[] = [];
  missions: Mission[] = [];
  partners: PartnerAssociation[] = [];
  potentialPartners: Association[] = [];
  partnershipError: string | null = null;
  partnershipSuccess: string | null = null;
  
  // Logo management
  partnerLogos: { [id: number]: SafeUrl } = {};
  potentialPartnerLogos: { [id: number]: SafeUrl } = {};
  logoLoadingStates: { [id: number]: boolean } = {};
  defaultLogo = '/assets/images/default-logo.png';

  statistics = [
    { 
      key: 'totalDonations', 
      value: 0, 
      label: 'Donations', 
      iconClass: 'uil uil-donate',
      bgClass: 'bg-primary bg-opacity-10 text-primary' 
    },
    { 
      key: 'totalMissions', 
      value: 0, 
      label: 'Missions', 
      iconClass: 'uil uil-rocket',
      bgClass: 'bg-success bg-opacity-10 text-success' 
    },
    { 
      key: 'totalPartners', 
      value: 0, 
      label: 'Partners', 
      iconClass: 'uil uil-handshake',
      bgClass: 'bg-warning bg-opacity-10 text-warning' 
    },
    { 
      key: 'partnershipScore', 
      value: 0, 
      label: 'P-Score', 
      iconClass: 'uil uil-star',
      bgClass: 'bg-info bg-opacity-10 text-info' 
    }
  ];

  // Activities
  activityFilters = ["all", "donations", "missions"];
  recentActivities: Activity[] = [];
  filterKey: string = "all";
  activitySearchTerm: string = '';

  constructor(
    private missionService: MissionService,
    private donationService: AssociationDonationService,
    private authService: AuthService,
    private associationService: AssociationService,
    private aidService: AidService,
    private eventService: EventService,
    private modalService: ModalService,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.initializeComponent();
  }

  private initializeComponent() {
    this.loadAssociation();
    this.loadDonations();
    this.loadMissions();
  }

  // ============== LOADING METHODS ==============
  private loadAssociation() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    this.associationService.getAssociationByUserId(userId.toString()).subscribe({
      next: (association) => {
        this.association = association;
        this.updateStatistics();
        this.loading = false;

        if (this.association?.associationLogoPath) {
          this.loadImage(this.association.associationLogoPath);
        }

        this.loadPartners();
      },
      error: (err) => {
        console.error('Association load error:', err);
        this.error = 'Failed to load association details';
        this.loading = false;
      }
    });
  }

  private loadPartners() {
    if (!this.association?.idAssociation) return;

    this.associationService.getPartners(this.association.idAssociation).subscribe({
      next: (partners) => {
        this.partners = partners || [];
        this.loadPartnerLogos();
        this.loadPotentialPartners();
        this.updateStatistics();
      },
      error: (err) => {
        console.error('Failed to load partners:', err);
        this.partnershipError = err.error?.message || 'Failed to load current partners';
        this.partners = [];
        this.loadPotentialPartners();
      }
    });
  }

  private loadPotentialPartners() {
    if (!this.association?.idAssociation) return;

    this.associationService.getPotentialPartners(this.association.idAssociation).subscribe({
      next: (partners) => {
        this.potentialPartners = partners || [];
        this.loadPotentialPartnerLogos();
        this.updateStatistics();
      },
      error: (err) => {
        console.error('Failed to load potential partners:', err);
        this.partnershipError = 'Failed to load potential partners. Please try again later.';
        this.potentialPartners = [];
      }
    });
  }

 // Load donations
 private loadDonations() {
  this.donationService.getDonationsByAssociation().subscribe({
    next: (donations) => {
      this.donations = donations;
      this.updateActivities(); // Update activities after fetching donations
    },
    error: (err) => {
      console.error('Error loading donations:', err);
    }
  });
}
// Load missions
private loadMissions() {
this.missionService.getMissionsByAssociation().subscribe({
  next: (missions) => {
    this.missions = missions;
    this.updateActivities(); // Update activities after fetching missions
  },
  error: (err) => {
    console.error('Error loading missions:', err);
  }
});
}

  // ============== LOGO HANDLING ==============
  private loadImage(filename: string): void {
    this.associationService.getAssociationLogo(filename).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: () => this.imageUrl = null
    });
  }

  private loadPartnerLogos() {
    this.partners.forEach(partner => {
      this.logoLoadingStates[partner.idAssociation] = true;
      if (partner.associationLogoPath) {
        this.associationService.getPartnerLogo(partner.associationLogoPath).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            this.partnerLogos[partner.idAssociation] = 
              this.sanitizer.bypassSecurityTrustUrl(url);
            this.logoLoadingStates[partner.idAssociation] = false;
          },
          error: () => this.handleLogoError(partner.idAssociation)
        });
      } else {
        this.handleLogoError(partner.idAssociation);
      }
    });
  }

  private loadPotentialPartnerLogos() {
    this.potentialPartners.forEach(partner => {
      this.logoLoadingStates[partner.idAssociation] = true;
      if (partner.associationLogoPath) {
        this.associationService.getPotentialPartnerLogo(partner.associationLogoPath).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            this.potentialPartnerLogos[partner.idAssociation] = 
              this.sanitizer.bypassSecurityTrustUrl(url);
            this.logoLoadingStates[partner.idAssociation] = false;
          },
          error: () => this.handleLogoError(partner.idAssociation, true)
        });
      } else {
        this.handleLogoError(partner.idAssociation, true);
      }
    });
  }

  private handleLogoError(partnerId: number, isPotential = false) {
    if (isPotential) {
      this.potentialPartnerLogos[partnerId] = 
        this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
    } else {
      this.partnerLogos[partnerId] = 
        this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
    }
    this.logoLoadingStates[partnerId] = false;
  }

  getPartnerLogo(partner: PartnerAssociation): SafeUrl {
    return this.partnerLogos[partner.idAssociation] || 
           this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
  }

  getPotentialPartnerLogo(partner: Association): SafeUrl {
    return this.potentialPartnerLogos[partner.idAssociation] || 
           this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
  }

  // ============== DATA UPDATES ==============
  private updateStatistics() {
    this.statistics = [
      { 
        key: 'totalDonations', 
        value: this.donations.length,
        label: 'Donations', 
        iconClass: 'uil uil-donate',
        bgClass: 'bg-primary bg-opacity-10 text-primary' 
      },
      { 
        key: 'totalMissions', 
        value: this.missions.length,
        label: 'Missions', 
        iconClass: 'uil uil-rocket',
        bgClass: 'bg-success bg-opacity-10 text-success' 
      },
      { 
        key: 'totalPartners', 
        value: this.partners.length,
        label: 'Partners', 
        iconClass: 'uil uil-handshake',
        bgClass: 'bg-warning bg-opacity-10 text-warning' 
      },
      { 
        key: 'partnershipScore', 
        value: this.association?.partnershipScore || 0,
        label: 'P-Score', 
        iconClass: 'uil uil-star',
        bgClass: 'bg-info bg-opacity-10 text-info' 
      }
    ];
  }

  private updateActivities() {
    const donationActivities: Activity[] = this.donations.map(donation => ({
      id: donation.idDonation?.toString() || '',
      type: 'donation',
      title: 'New Donation',
      description: `Donation of type ${donation.donationType}`,
      date: new Date(donation.lastUpdated)
    }));

    const missionActivities: Activity[] = this.missions.map(mission => ({
      id: mission.idMission?.toString() || '',
      type: 'mission',
      title: 'New Mission',
      description: `Mission: ${mission.description}`,
      date: new Date(mission.startDate)
    }));

    this.recentActivities = [...donationActivities, ...missionActivities];
    this.sortActivities('newest');
  }

  // ============== UI ENHANCEMENTS ==============
  showPartnerDetails(partner: any) {
    this.modalService.open('partner-details', {
      title: partner.associationName,
      content: `
        <p><strong>Address:</strong> ${partner.associationAddress || 'Not specified'}</p>
        <p><strong>Description:</strong> ${partner.description || 'Not provided'}</p>
        <p><strong>Partnership Score:</strong> ${partner.partnershipScore || 0}</p>
      `,
      size: 'md'
    });
  }

  sortActivities(order: 'newest' | 'oldest') {
    this.recentActivities.sort((a, b) => 
      order === 'newest' 
        ? b.date.getTime() - a.date.getTime()
        : a.date.getTime() - b.date.getTime()
    );
  }

  get filteredActivities(): Activity[] {
    let activities = this.recentActivities;
    
    if (this.filterKey !== "all") {
      activities = activities.filter(a => a.type === this.filterKey);
    }
    
    if (this.activitySearchTerm) {
      const term = this.activitySearchTerm.toLowerCase();
      activities = activities.filter(a => 
        a.title.toLowerCase().includes(term) || 
        a.description.toLowerCase().includes(term)
      );
    }
    
    return activities;
  }

  getStatTooltip(statKey: string): string {
    const tooltips: Record<string, string> = {
      totalDonations: 'Total donations received by your association',
      totalMissions: 'Active and completed missions',
      totalPartners: 'Current partnered organizations',
      partnershipScore: 'Your partnership reputation score (0-100)'
    };
    return tooltips[statKey] || '';
  }

  refreshData() {
    this.loading = true;
    this.clearMessages();
    this.initializeComponent();
  }

  // ============== NAVIGATION METHODS ==============
  onCreateDonation() {
    this.router.navigate(['/association/account/creedoantion']);
  }

  onCreateMission() {
    this.router.navigate(['/association/account/creemission']);
  }

  onCreateAidAnnouncement() {
    this.router.navigate(['/aid/create']);
  }

  onCreateEvent() {
    this.router.navigate(['/events/create']);
  }

  // ============== ACTIVITY METHODS ==============
  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      donation: 'uil uil-donate',
      case: 'uil uil-file-medical',
      event: 'uil uil-calendar-alt',
      member: 'uil uil-users-alt',
      mission: 'uil uil-rocket'
    };
    return icons[type] || 'uil uil-question-circle';
  }

  setActivityFilter(filterKey: string) {
    if (this.activityFilters.includes(filterKey)) {
      this.filterKey = filterKey;
    }
  }

  // ============== ASSOCIATION METHODS ==============
  deleteAssociation() {
    if (this.association && this.association.idAssociation !== undefined) {
      if (confirm('Are you sure you want to delete this association? This action cannot be undone.')) {
        this.associationService.deleteAssociation(this.association.idAssociation).subscribe({
          next: () => {
            this.authService.logout();
            this.router.navigate(['/associations']);
          },
          error: (err) => {
            console.error('Error deleting association:', err);
            this.error = 'Failed to delete association. Please try again.';
          }
        });
      }
    } else {
      console.error('Association ID is undefined');
    }
  }

  // ============== PARTNERSHIP METHODS ==============
  createPartnership(partnerId: number) {
    if (!this.association?.idAssociation) return;

    this.clearMessages();
    this.associationService.createPartnership(this.association.idAssociation, partnerId).subscribe({
      next: () => {
        this.partnershipSuccess = 'Partnership created successfully';
        setTimeout(() => this.partnershipSuccess = null, 3000);
        this.loadPartners();
        this.loadPotentialPartners();
      },
      error: (err) => {
        this.partnershipError = err.error?.message || 'Failed to create partnership';
        setTimeout(() => this.partnershipError = null, 3000);
      }
    });
  }

  removePartnership(partnerId: number) {
    if (!this.association?.idAssociation) return;
  
    this.clearMessages();
    this.associationService.removePartnership(this.association.idAssociation, partnerId).subscribe({
      next: () => {
        this.partnershipSuccess = 'Partnership removed successfully';
        setTimeout(() => this.partnershipSuccess = null, 3000);
        this.loadPartners();       // This reloads partners list
        this.loadPotentialPartners();
      },
      error: (err) => {
        this.partnershipError = err.error?.message || 'Failed to remove partnership';
        setTimeout(() => this.partnershipError = null, 3000);
      }
    });
  }

  // ============== ACTIVITY CRUD METHODS ==============
  onDeleteActivity(activity: Activity) {
    if (activity.type === 'donation') {
      this.deleteDonation(activity.id);
    } else if (activity.type === 'mission') {
      this.deleteMission(activity.id);
    }
  }

  onEditActivity(activity: Activity) {
    if (activity.type === 'donation') {
      this.editDonation(activity.id);
    } else if (activity.type === 'mission') {
      this.editMission(activity.id);
    }
  }

  private deleteDonation(id: string) {
    const donationId = parseInt(id, 10);
    if (confirm('Are you sure you want to delete this donation?')) {
      this.clearMessages();
      this.donationService.deleteDonation(donationId).subscribe({
        next: () => {
          this.loadDonations();
          this.partnershipSuccess = 'Donation deleted successfully';
          setTimeout(() => this.partnershipSuccess = null, 3000);
        },
        error: (err) => {
          console.error('Error deleting donation:', err);
          this.partnershipError = 'Failed to delete donation';
          setTimeout(() => this.partnershipError = null, 3000);
        }
      });
    }
  }

  private deleteMission(id: string) {
    const missionId = parseInt(id, 10);
    if (confirm('Are you sure you want to delete this mission?')) {
      this.clearMessages();
      this.missionService.deleteMission(missionId).subscribe({
        next: () => {
          this.loadMissions();
          this.partnershipSuccess = 'Mission deleted successfully';
          setTimeout(() => this.partnershipSuccess = null, 3000);
        },
        error: (err) => {
          console.error('Error deleting mission:', err);
          this.partnershipError = 'Failed to delete mission';
          setTimeout(() => this.partnershipError = null, 3000);
        }
      });
    }
  }

  private editDonation(id: string) {
    const donationId = parseInt(id, 10);
    this.router.navigate(['/association/account/edit-donation', donationId]);
  }

  private editMission(id: string) {
    const missionId = parseInt(id, 10);
    this.router.navigate(['/association/account/edit-mission', missionId]);
  }
  onManageDons(activity: Activity) {
    if (activity.type === 'donation') {
      this.router.navigate(['/validate-dons', activity.id]);
    }
  }
  
  // ============== UTILITY METHODS ==============
  private clearMessages() {
    this.error = null;
    this.partnershipError = null;
    this.partnershipSuccess = null;
  }
}