import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss'
})
export class EventDetailComponent implements OnInit {
event: Event | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getEventDetails();
  }

  getEventDetails(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')); // Récupère l'ID depuis l'URL
    if (id) {
      this.isLoading = true;
      this.eventService.getEventById(id).subscribe({
        next: (data) => {
          this.event = data;
          this.isLoading = false;
          console.log('Event details fetched:', data);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error fetching event details:', error);
          this.errorMessage = 'Erreur lors de la récupération des détails de l’événement';
        }
      });
    } else {
      this.isLoading = false;
      this.errorMessage = 'ID de l’événement invalide';
    }
  }


}

