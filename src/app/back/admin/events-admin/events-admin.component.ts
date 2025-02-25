import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { EventService, Event } from 'src/app/services/event.service';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';

@Component({
  selector: 'app-events-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    AdminNavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule,
    BlogSidebarsComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    EventService,
  ],
  templateUrl: './events-admin.component.html',
  styleUrls: ['./events-admin.component.scss'],
})
export class EventsAdminComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error: string | null = null;

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.error = 'No authentication token found. Please log in.';
      this.loading = false;
      return;
    }

    this.eventService.getAllEvents().subscribe({
      next: (data: Event[]) => {
        this.events = data;
        this.loading = false;
        console.log('Events loaded:', this.events);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.error =
          'Error loading events: ' +
          (error.message || 'Check the console');
        this.loading = false;
      },
    });
  }

  deleteEvent(id: number | undefined): void {
    if (id === undefined) {
      this.error = 'Event ID missing';
      return;
    }
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          this.events = this.events.filter((event) => event.idEvent !== id);
          console.log(`Event ${id} deleted successfully`);
          this.error = null;
        },
        error: (error) => {
          console.error('Error during deletion:', error);
          this.error =
            'Error deleting event: ' +
            (error.message || 'Check the console');
        },
      });
    }
  }

  editEvent(event: Event): void {
    this.router.navigate(['/edit-event', event.idEvent]);
  }

  onAddEvent(): void {
    this.router.navigate(['/add-event']);
  }
  getStatusClass(typeEvent: string): string {
    switch (typeEvent.toLowerCase()) {
      case 'conference':
        return 'success';
      case 'workshop':
        return 'warning';
      default:
        return 'secondary';
    }
  }
}