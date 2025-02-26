import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AssociationService } from '../../services/association.service';
import { AidService } from '../../services/aid.service';
import { EventService } from '../../services/event.service';
import { ModalService } from '../../services/modal.service';
import { Association, AidCase } from '../../interfaces/association.interface';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { TndPipe } from '../../shared/pipes/tnd.pipe';
import { AdminNavbarComponent } from '../admin/admin-navbar/admin-navbar.component';
interface Activity {
  id: string;
  type: 'donation' | 'case' | 'event' | 'member';
  title: string;
  description: string;
  date: Date;
}

@Component({
  selector: 'app-association-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    TimeAgoPipe,
    ModalComponent,
    TndPipe,
    AdminNavbarComponent


  ],
  templateUrl: './association-account.component.html',
  styleUrls: ['./association-account.component.scss']
})
export class AssociationAccountComponent implements OnInit {
  association: Association | null = null;
  loading = true;
  error: string | null = null;
  statistics: {
    totalDonations: number;
    totalCases: number;
    totalEvents: number;
    totalMembers: number;
  } = {
    totalDonations: 0,
    totalCases: 0,
    totalEvents: 0,
    totalMembers: 0
  };  
  
  activityFilter: 'all' | 'donations' | 'cases' = 'all';
  recentActivities: Activity[] = [];

  constructor(
    private associationService: AssociationService,
    private aidService: AidService,
    private eventService: EventService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.loadAssociation();
  }

  private async loadAssociation() {
    try {
      this.loading = true;
      this.associationService.currentAssociation$.subscribe({
        next: (association) => {
          this.association = association;
          if (association) {
            this.loadActivities();
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading association:', err);
          this.error = 'Failed to load association details';
          this.loading = false;
        }
      });
    } catch (error) {
      this.error = 'An unexpected error occurred';
      this.loading = false;
    }
  }

  private loadActivities() {
    // In a real app, this would come from an API
    this.recentActivities = [
      {
        id: '1',
        type: 'donation',
        title: 'New Donation Received',
        description: 'John Doe donated $100 to Medical Aid Case',
        date: new Date()
      },
      // Add more activities...
    ];
  }

  get filteredActivities(): Activity[] {
    if (this.activityFilter === 'all') return this.recentActivities;
    return this.recentActivities.filter(a => 
      this.activityFilter === 'donations' ? a.type === 'donation' : a.type === 'case'
    );
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'donation': return 'uil-money-bill';
      case 'case': return 'uil-medical-square';
      case 'event': return 'uil-calendar-alt';
      case 'member': return 'uil-user';
      default: return 'uil-bell';
    }
  }

  getUrgencyClass(urgency: string): string {
    switch (urgency) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }
  

  async onCreateAidAnnouncement() {
    this.modalService.open('aid-announcement-form', {
      association: this.association
    });
  }

  async onCreateEvent() {
    this.modalService.open('event-form', {
      association: this.association
    });
  }

  async onUploadMedia() {
    this.modalService.open('media-upload', {
      association: this.association
    });
  }

  async onManageMembers() {
    this.modalService.open('member-management', {
      association: this.association
    });
  }

  viewCase(aidCase: AidCase) {
    this.modalService.open('aid-case-details', { aidCase });
  }

  editCase(aidCase: AidCase) {
    this.modalService.open('aid-announcement-form', {
      association: this.association,
      aidCase
    });
  }

  setActivityFilter(filter: 'all' | 'donations' | 'cases') {
    this.activityFilter = filter;
  }
} 