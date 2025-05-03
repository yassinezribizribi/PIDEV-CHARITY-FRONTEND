import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import BlogData from '../../../data/blog.json'
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { Event, EventService } from 'src/app/services/event.service';
import { jwtDecode } from 'jwt-decode';

@Component({
    selector: 'app-blog-detail',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        BlogSidebarsComponent,
        FooterComponent,
        ScrollToTopComponent
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

  markInterested(eventId: number) {
    const idUser = this.getUserIdFromToken(); // Extract userId from token
  
    if (!idUser) {
      this.showModal('error'); // Changed from console.error
      return;
    }
  
    this.eventService.markUserAsInterested(eventId, idUser).subscribe({
      next: () => {
        this.showModal('success');
        // this.loadEvents(); // Reload events to reflect changes
      },
      error: (err) => {
        this.showModal('error'); // Changed from console.error
      }
    });
  }
  
    private showModal(type: 'success' | 'error'): void {
      const modalId = type === 'success' ? 'eventInterestModal' : 'eventErrorModal';
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const bootstrapModal = new (window as any).bootstrap.Modal(modalElement);
        bootstrapModal.show();
      } else {
        console.error(`Modal with ID ${modalId} not found`);
      }
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
    

}
