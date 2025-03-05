import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AssociationService } from '../../services/association.service';
import { AidService } from '../../services/aid.service';
import { EventService } from '../../services/event.service';
import { ModalService } from '../../services/modal.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { Association, AssociationStatus } from '../../interfaces/association.interface';
import { TndPipe } from '../../shared/pipes/tnd.pipe';
import { AdminNavbarComponent } from '../admin/admin-navbar/admin-navbar.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { environment } from 'src/environments/environment';

import { AuthService } from 'src/app/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Donation } from 'src/app/interfaces/donation.interface';
import { Mission } from 'src/app/interfaces/mission.interface';
import{AssociationDonationService} from '../../services/association-donation.service';
import{MissionService} from '../../services/mission.service';


interface Activity {
  id: string;
  type: 'donation' | 'case' | 'event' | 'member'|'mission';
  title: string;
  description: string;
  date: Date;
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
    RouterLink
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

  statistics = [
    { 
      key: 'totalDonations', 
      value: 0, 
      label: 'Donations', 
      iconClass: 'uil uil-donate',
      bgClass: 'bg-primary bg-opacity-10 text-primary' 
    },
    { 
      key: 'totalCases', 
      value: 0, 
      label: 'Cases', 
      iconClass: 'uil uil-file-medical',
      bgClass: 'bg-success bg-opacity-10 text-success' 
    },
    { 
      key: 'totalEvents', 
      value: 0, 
      label: 'Events', 
      iconClass: 'uil uil-calendar-alt',
      bgClass: 'bg-warning bg-opacity-10 text-warning' 
    },
    { 
      key: 'totalMembers', 
      value: 0, 
      label: 'Members', 
      iconClass: 'uil uil-users-alt',
      bgClass: 'bg-info bg-opacity-10 text-info' 
    }
  ];

  activityFilters = ["all", "donations", "cases", "missions"];  recentActivities: Activity[] = [];
  filterKey: string = "all"; // Default filter

  constructor(
    private missionService: MissionService, // Inject MissionService
    private donationService: AssociationDonationService, // Inject AssociationDonationService

    private authService: AuthService,
    private associationService: AssociationService,
    private aidService: AidService,
    private eventService: EventService,
    private modalService: ModalService,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer  // Add this line to inject DomSanitizer
  ) {}

  ngOnInit() {
    this.loadAssociation();
    this.loadDonations();
    this.loadMissions();


  }
   // Load donations
   private loadDonations() {
    this.donationService.getDonations().subscribe({
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
  this.missionService.getMissions().subscribe({
    next: (missions) => {
      this.missions = missions;
      this.updateActivities(); // Update activities after fetching missions
    },
    error: (err) => {
      console.error('Error loading missions:', err);
    }
  });
}
// Combine donations and missions into activities
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

  // Combine donations and missions into a single list
  this.recentActivities = [...donationActivities, ...missionActivities];
}

  private loadAssociation() {
    const userId = this.authService.getUserId();
    const token = this.authService.getToken();

    if (!userId || !token) {
      this.error = 'User not authenticated';
      this.loading = false; // Ensure loading is set to false
      return;
    }

    this.associationService.getAssociationByUserId(userId.toString()).subscribe({
      next: (association) => {
        console.log('Association returned:', association);
        this.association = association;
        this.loading = false; // Ensure loading is set to false

        // Ensure the logo path is correctly set
        if (this.association?.associationLogoPath) {
          this.loadImage(this.association.associationLogoPath);
        } else {
          this.imageUrl = '/assets/images/default-logo.png';  // Fallback if no logo
        }
      },
      error: (err) => {
        console.error('Error loading associations:', err);
        this.error = 'Failed to load association details';
        this.loading = false; // Ensure loading is set to false
      }
    });
  }

  loadImage(filename: string): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found in loadImage');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(
      `http://localhost:8089/api/associations/protected/files/${filename}`,
      { headers, responseType: 'blob' }
    ).pipe(
      catchError((error: any) => {
        console.error('Error loading image:', error);
        return throwError(() => error);
      })
    ).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: () => this.imageUrl = null
    });
  }
  onCreateDonation() {
    this.router.navigate(['/association/account/creedoantion']);
  }
  onCreateMission() {
    this.router.navigate(['/association/account/creemission']);
  }

  onCreateAidAnnouncement() {
    // Implement your create aid announcement logic
    this.router.navigate(['/aid/create']);
  }

  onCreateEvent() {
    // Implement your create event logic
    this.router.navigate(['/events/create']);
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      donation: 'uil uil-donate',
      case: 'uil uil-file-medical',
      event: 'uil uil-calendar-alt',
      member: 'uil uil-users-alt',
      mission: 'uil uil-rocket' // Add an icon for missions
    };
    return icons[type] || 'uil uil-question-circle';
  }
  // Add any additional methods to handle activities, events, donations, etc.



  private loadActivities() {
    this.recentActivities = [
      {
        id: '1',
        type: 'donation',
        title: 'New Donation Received',
        description: 'John Doe donated $100 to Medical Aid Case',
        date: new Date()
      }
    ];
  }

  get filteredActivities(): Activity[] {
    if (this.filterKey === "all") {
      return this.recentActivities;
    }
    return this.recentActivities.filter(activity => activity.type === this.filterKey);
  }

  setActivityFilter(filterKey: string) {
    if (this.activityFilters.includes(filterKey)) {
      this.filterKey = filterKey;
    }
  }

  getStatisticsArray() {
    return Object.entries(this.statistics).map(([key, value]) => ({ key, value }));
  }

  deleteAssociation() {
    if (this.association && this.association.idAssociation !== undefined) {
      this.associationService.deleteAssociation(this.association.idAssociation).subscribe({
        next: () => this.router.navigate(['/associations']),
        error: (err) => console.error('Error deleting association:', err)
      });
    } else {
      console.error('Association ID is undefined');
    }
  }




// Method to handle deleting an activity
onDeleteActivity(activity: Activity) {
  if (activity.type === 'donation') {
    this.deleteDonation(activity.id);
  } else if (activity.type === 'mission') {
    this.deleteMission(activity.id);
  }
}

// Method to handle editing an activity
onEditActivity(activity: Activity) {
  if (activity.type === 'donation') {
    this.editDonation(activity.id);
  } else if (activity.type === 'mission') {
    this.editMission(activity.id);
  }
}

// Delete a donation
deleteDonation(id: string) {
  const donationId = parseInt(id, 10);
  this.donationService.deleteDonation(donationId).subscribe({
    next: () => {
      console.log('Donation deleted successfully');
      this.loadDonations(); // Reload donations after deletion
    },
    error: (err) => {
      console.error('Error deleting donation:', err);
    }
  });
}

// Delete a mission
deleteMission(id: string) {
  const missionId = parseInt(id, 10);
  this.missionService.deleteMission(missionId).subscribe({
    next: () => {
      console.log('Mission deleted successfully');
      this.loadMissions(); // Reload missions after deletion
    },
    error: (err) => {
      console.error('Error deleting mission:', err);
    }
  });
}

// Edit a donation
editDonation(id: string) {
  const donationId = parseInt(id, 10);
  this.router.navigate(['/association/account/edit-donation', donationId]);
}

// Edit a mission
editMission(id: string) {
  const missionId = parseInt(id, 10);
  this.router.navigate(['/association/account/edit-mission', missionId]);
}






}