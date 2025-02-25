import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { EventService, Event } from '../../services/event.service';
import { TokenInterceptor } from '../../interceptors/token.interceptor';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    BlogSidebarsComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    EventService
  ],
    templateUrl: './blog-detail.component.html',
    styleUrl: './blog-detail.component.scss'
})


export class BlogDetailComponent implements OnInit {
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
