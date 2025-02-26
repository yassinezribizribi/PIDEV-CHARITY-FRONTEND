import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { EventService, Event } from 'src/app/services/event.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AdminNavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    FormsModule,
    HttpClientModule,
  ],
  providers: [EventService],
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss'],
})
export class AddEventComponent {
  newEvent: Event = {
    idEvent: 0, // Will be set by backend
    title: '',
    description: '',
    dateTime: '',
    location: '',
    typeEvent: '',
    reservationDate: '',
    associationId: null,
  };
  errorMessage = '';
  successMessage = '';

  constructor(private eventService: EventService, private router: Router) {}

  addEvent(): void {
    // Client-side validation based on backend EventDTO constraints
    if (!this.newEvent.title || this.newEvent.title.length < 3 || this.newEvent.title.length > 100) {
      this.errorMessage = 'Title is required and must be between 3 and 100 characters.';
      return;
    }
    if (!this.newEvent.description || this.newEvent.description.length < 5 || this.newEvent.description.length > 500) {
      this.errorMessage = 'Description is required and must be between 5 and 500 characters.';
      return;
    }
    if (!this.newEvent.dateTime) {
      this.errorMessage = 'Date and time are required.';
      return;
    }
    if (new Date(this.newEvent.dateTime) <= new Date()) {
      this.errorMessage = 'Date and time must be in the future.';
      return;
    }
    if (!this.newEvent.location) {
      this.errorMessage = 'Location is required.';
      return;
    }
    if (!this.newEvent.typeEvent) {
      this.errorMessage = 'Event type is required.';
      return;
    }
    if (!this.newEvent.reservationDate) {
      this.errorMessage = 'Reservation date is required.';
      return;
    }
    if (new Date(this.newEvent.reservationDate) > new Date()) {
      this.errorMessage = 'Reservation date must be today or in the past.';
      return;
    }
    if (!this.newEvent.associationId || this.newEvent.associationId < 1) {
      this.errorMessage = 'Association ID is required and must be a positive number.';
      return;
    }

    // Clear any previous error
    this.errorMessage = '';

    // Call the service to add the event
    this.eventService.addEvent(this.newEvent).subscribe({
      next: (addedEvent) => {
        this.successMessage = 'Event added successfully!';
        this.errorMessage = '';
        // Reset form
        this.newEvent = {
          idEvent: 0,
          title: '',
          description: '',
          dateTime: '',
          location: '',
          typeEvent: '',
          reservationDate: '',
          associationId: null,
        };
        // Redirect back to events-admin after 1.5 seconds
        setTimeout(() => {
          this.router.navigate(['/events-admin']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error adding event:', error);
        this.errorMessage = 'Error adding event: ' + (error.message || 'Check the console');
        this.successMessage = '';
      },
    });
  }
}