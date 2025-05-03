import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { EventService, Event } from 'src/app/services/event.service';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-view-event-admin',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    AdminNavbarComponent,
    BlogSidebarsComponent,
    CommonModule],
  templateUrl: './view-event-admin.component.html',
  styleUrl: './view-event-admin.component.scss'
})
export class ViewEventAdminComponent {
  isAffected: boolean = false;
  eventSubscribers: any[] = [];
  eventId: number | null = null;
  event!: Event;
  eventDetails: any = null;

  constructor(private eventService: EventService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Extract eventId from URL parameters
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));

    // Ensure the value is valid
    if (!this.eventId || isNaN(this.eventId)) {
      console.error("Invalid Event ID from route.");
      return;
    }

    console.log("Event ID retrieved:", this.eventId);

    // Load subscribers automatically
    this.getEventSubscribers();
  }

  getEventSubscribers(): void {
    if (!this.eventId) {
      console.error("Event ID is missing.");
      return;
    }

    this.eventService.getEventSubscribers(this.eventId).subscribe({
      next: (subscribers) => {
        this.eventSubscribers = subscribers;
        console.log("Subscribers loaded:", this.eventSubscribers);
      },
      error: (err) => console.error("Error fetching event subscribers:", err)
    });
  }

  affect(userId: any) {
    console.log(userId, this.eventId);
    this.eventService.affect(this.eventId, userId).subscribe({
      next: (data) => {
        this.isAffected = !this.isAffected;
        this.showModal('success');
      },
      error: (error) => {
        console.log(error);
        this.showModal('error');
      }
    });
  }

  private showModal(type: 'success' | 'error'): void {
    const modalId = type === 'success' ? 'eventAffectModal' : 'eventAffectErrorModal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modalElement);
      bootstrapModal.show();
    } else {
      console.error(`Modal with ID ${modalId} not found`);
    }
  }
  
}