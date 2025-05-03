import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { jwtDecode } from 'jwt-decode';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';
import { EventService } from 'src/app/services/event.service';
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin dayGrid pour la vue par mois
import interactionPlugin from '@fullcalendar/interaction'; // Plugin pour les interactions, comme le drag and drop
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarOptions } from '@fullcalendar/core';
@Component({
  selector: 'app-interesse',
  imports: [
    CommonModule,
    RouterLink,
    FullCalendarModule,
    NavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule,
    BlogSidebarsComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    EventService,
  ],
  templateUrl: './interesse.component.html',
  styleUrl: './interesse.component.scss'
})
export class InteresseComponent implements OnInit {
  
  events: any[] = [];
  calendarEvents: any[] = [];  
  errorMessage = '';
  isLoading = true;
  selectedEvent: any = null; 
  constructor(private eventService: EventService, private router: Router) {}

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    events: this.calendarEvents,  
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    eventClick: (info) => this.onEventClick(info), 
  };
  userId: any;
  ngOnInit(): void {
    this.userId = this.getUserIdFromToken();
    console.log("hennn"+this.userId);
    this.getAllEvents();
  }
  onEventClick(info: any): void {
    const eventId = info.event.id;
    console.log('Événement cliqué : ', eventId);
    this.router.navigate(['/blog-detail', eventId]); 
  }
  loadEvents() {
    this.calendarEvents = this.events.map((event: any) => ({
      id:event.idEvent,
      date: event.dateTime, 
      title: event.title 
      
    }));
  }
  goToEventDetails(event: any): void {
    console.log(event);
    
    this.router.navigate(['/blog-detail/', event.idEvent]);  
  }

  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('auth_token');
    console.log("token:", token);
    
    if (!token) return null;
  
    try {
      const decodedToken: any = jwtDecode(token);
      
      return decodedToken.idUser;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  getAllEvents(): void {
    this.isLoading = true;
    this.eventService.getEvent(this.userId).subscribe({
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

  selectEvent(event: any): void {
    this.selectedEvent = this.events.find(e => e.idEvent === event.id);
    console.log(this.selectEvent);
    
    this.router.navigate(['/blog-detail/',this.selectedEvent]);  

  }
}
