import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin dayGrid pour la vue par mois
import interactionPlugin from '@fullcalendar/interaction'; // Plugin pour les interactions, comme le drag and drop
import timeGridPlugin from '@fullcalendar/timegrid';
import BlogData from '../../../data/blog.json'
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { Event, EventService } from 'src/app/services/event.service';
import { FullCalendarModule } from '@fullcalendar/angular'; 
import { CalendarOptions } from '@fullcalendar/core';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

@Component({
    selector: 'app-blog-sidebar',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        FullCalendarModule,
        BlogSidebarsComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './blog-sidebar.component.html',
    styleUrl: './blog-sidebar.component.scss'
})
export class BlogSidebarComponent implements OnInit {
  events: any[] = [];
  recommendedEvents: any[] = [];
  calendarEvents: any[] = [];
  errorMessage = '';
  isLoading = true;
  selectedEvent: any = null;
  userId: number | null = null;
  showInterestedOnly: boolean = false; // Toggle state

  constructor(private eventService: EventService, private router: Router) {}

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    events: this.calendarEvents,
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    eventClick: (info) => this.onEventClick(info),
    eventContent: (arg) => {
      const titleElement = document.createElement('div');
      titleElement.innerHTML = arg.event.title;
      return { domNodes: [titleElement] };
    }
  };

  ngOnInit(): void {
    this.userId = this.getUserIdFromToken();
    console.log('userId:', this.userId);
    this.loadEventsData();
  }

  toggleEventView(): void {
    this.showInterestedOnly = !this.showInterestedOnly;
    this.isLoading = true;
    this.events = [];
    this.calendarEvents = [];
    this.loadEventsData();
  }

  loadEventsData(): void {
    if (this.showInterestedOnly) {
      this.getInterestedEvents();
    } else {
      this.getAllEvents();
      if (this.userId) {
        this.getRecommendedEvents();
      } else {
        this.errorMessage = 'Utilisateur non authentifié.';
        this.isLoading = false;
      }
    }
  }

  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('auth_token');
    console.log('token:', token);
    if (!token) return null;
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.idUser;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getRecommendedEvents(): void {
    if (this.userId) {
      this.eventService.getRecommendedEvents(this.userId).subscribe({
        next: (data) => {
          console.log('Processed recommended events:', data);
          this.recommendedEvents = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching recommended events:', error);
          this.errorMessage = 'Erreur lors de la récupération des événements recommandés';
          this.isLoading = false;
        },
      });
    }
  }

  getAllEvents(): void {
    this.isLoading = true;
    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        console.log(data);
        this.events = data;
        this.isLoading = false;
        this.loadEvents();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching events:', error);
        this.errorMessage = 'Erreur lors de la récupération des événements';
      }
    });
  }

  getInterestedEvents(): void {
    this.isLoading = true;
    this.eventService.getEvent(this.userId!).subscribe({
      next: (data) => {
        console.log(data);
        this.events = data;
        this.isLoading = false;
        this.loadEvents();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching interested events:', error);
        this.errorMessage = 'Erreur lors de la récupération des événements';
      }
    });
  }

  loadEvents() {
    this.calendarEvents = this.events.map((event: any) => ({
      id: event.idEvent,
      date: event.dateTime,
      title: event.title
    }));
  }

  onEventClick(info: any): void {
    const eventId = info.event.id;
    console.log('Événement cliqué : ', eventId);
    this.router.navigate(this.showInterestedOnly ? ['/interested/event', eventId] : ['/blog-detail', eventId]);
  }

  goToEventDetails(event: any): void {
    console.log(event);
    this.router.navigate(['/blog-detail/', event.idEvent]);
  }

  selectEvent(event: any): void {
    this.selectedEvent = this.events.find(e => e.idEvent === event.id);
    console.log(this.selectedEvent);
    this.router.navigate(['/blog-detail/', this.selectedEvent]);
  }
}