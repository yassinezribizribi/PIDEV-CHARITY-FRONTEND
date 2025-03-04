import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

import BlogData from '../../../data/blog.json'
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { Event, EventService } from 'src/app/services/event.service';

@Component({
    selector: 'app-blog-sidebar',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        BlogSidebarsComponent,
        FooterComponent,
        ScrollToTopComponent
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
