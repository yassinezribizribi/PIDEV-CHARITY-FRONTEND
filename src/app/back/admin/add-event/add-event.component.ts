import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { EventService, Event } from 'src/app/services/event.service';
import { HttpClientModule } from '@angular/common/http';
import { TypeEvent } from 'src/app/models/enums/typeEvent.model';
import { jwtDecode } from 'jwt-decode';

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
    typeEvent: TypeEvent.ANIMAL_WELFARE,
    reservationDate: '',
    associationId: null,
  };
  errorMessage = '';
  successMessage = '';
  eventTypes: string[] = Object.values(TypeEvent) as string[];

  constructor(private eventService: EventService, private router: Router) {
  }


  
  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
  
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.idUser;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
  

  addEvent(): void {
    const idUser = this.getUserIdFromToken();
    if (!idUser) {
      this.errorMessage = 'User is not authenticated. Please log in.';
      return;
    }
  
    // Ensure form fields are correctly assigned
    if (!this.newEvent.title || !this.newEvent.description || !this.newEvent.dateTime || 
        !this.newEvent.location || !this.newEvent.typeEvent || !this.newEvent.reservationDate) {
      this.errorMessage = 'All fields are required!';
      return;
    }

      this.newEvent.dateTime = new Date(this.newEvent.dateTime).toISOString();

  
    // Assign associationId before sending the request
    this.newEvent.associationId = 1;
  
    console.log("Sending event:", this.newEvent);
  
    this.eventService.addEvent(this.newEvent).subscribe({
      next: () => {
        this.successMessage = 'Event added successfully!';
        this.errorMessage = '';
        
        // Reset form fields after success
        this.newEvent = {
          idEvent: 0,
          title: '',
          description: '',
          dateTime: '',
          location: '',
          typeEvent: TypeEvent.ANIMAL_WELFARE,
          reservationDate: '',
          associationId: null,
        };
  
        // Redirect back to events-admin after 1.5 seconds
        setTimeout(() => {
          this.router.navigate(['/admin/events-admin']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error adding event:', error);
        this.errorMessage = 'Error adding event: ' + (error.message || 'Check the console');
        this.successMessage = '';
      },
    });
  }

  
  
    // Client-side validation based on backend EventDTO constraints
    // if (!this.newEvent.title || this.newEvent.title.length < 3 || this.newEvent.title.length > 100) {
    //   this.errorMessage = 'Title is required and must be between 3 and 100 characters.';
    //   return;
    // }
    // if (!this.newEvent.description || this.newEvent.description.length < 5 || this.newEvent.description.length > 500) {
    //   this.errorMessage = 'Description is required and must be between 5 and 500 characters.';
    //   return;
    // }
    // if (!this.newEvent.dateTime) {
    //   this.errorMessage = 'Date and time are required.';
    //   return;
    // }
    // if (new Date(this.newEvent.dateTime) <= new Date()) {
    //   this.errorMessage = 'Date and time must be in the future.';
    //   return;
    // }
    // if (!this.newEvent.location) {
    //   this.errorMessage = 'Location is required.';
    //   return;
    // }
    // if (!this.newEvent.typeEvent) {
    //   this.errorMessage = 'Event type is required.';
    //   return;
    // }
    // if (!this.newEvent.reservationDate) {
    //   this.errorMessage = 'Reservation date is required.';
    //   return;
    // }
    // if (new Date(this.newEvent.reservationDate) > new Date()) {
    //   this.errorMessage = 'Reservation date must be today or in the past.';
    //   return;
    // }
    // if (!this.newEvent.associationId || this.newEvent.associationId < 1) {
    //   this.errorMessage = 'Association ID is required and must be a positive number.';
    //   return;
    // }

    // Clear any previous error
    // this.errorMessage = '';

    // console.log("associationId before affect", this.newEvent.associationId);

    //     this.newEvent.associationId = userId;
    //     console.log("associationId after affect", this.newEvent.associationId);
        
  
    //     console.log("associationId just before sending", this.newEvent);

    // // Call the service to add the event
    // this.eventService.addEvent(this.newEvent).subscribe({
      
    //   next: (addedEvent) => {
    //     console.log("associationId after sending", this.newEvent);

    //     this.successMessage = 'Event added successfully!';
    //     this.errorMessage = '';
    //     // Reset form
    //     console.log("associationId after sending", this.newEvent.associationId);

    //     this.newEvent = {
    //       idEvent: 0,
    //       title: '',
    //       description: '',
    //       dateTime: '',
    //       location: '',
    //       typeEvent: TypeEvent.ANIMAL_WELFARE,
    //       reservationDate: '',
    //       associationId: null,
    //     };
    //     // Redirect back to events-admin after 1.5 seconds
    //     setTimeout(() => {
    //       this.router.navigate(['/events-admin']);
    //     }, 1500);
    //   },
    //   error: (error) => {
    //     console.error('Error adding event:', error);
    //     this.errorMessage = 'Error adding event: ' + (error.message || 'Check the console');
    //     this.successMessage = '';
    //   },
    // });
  
}
