import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { EventService, Event } from '../../services/event.service';
import { TokenInterceptor } from '../../interceptors/token.interceptor'; // À ajuster selon ton chemin
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    BlogSidebarsComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule // Nécessaire pour les requêtes HTTP
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }, 
    EventService // Service fourni au composant
  ],
    templateUrl: './blog-sidebar.component.html',
    styleUrl: './blog-sidebar.component.scss'
})
export class BlogSidebarComponent implements OnInit {
  events: Event[] = [];
  errorMessage = '';
  isLoading = true; 

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.getAllEvents();
  }

  getAllEvents(): void {
    this.isLoading = true;
    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.isLoading = false;
        console.log('Events fetched:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching events:', error);
        this.errorMessage = 'Erreur lors de la récupération des événements';
      }
    });
  }

  goToEventDetails(id: number): void {
    this.router.navigate(['/events', id]); 
  }

}
