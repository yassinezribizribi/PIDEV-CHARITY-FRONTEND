import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { EventService, Event } from 'src/app/services/event.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { TypeEvent } from 'src/app/models/enums/typeEvent.model';

@Component({
  selector: 'app-edit-event-admin',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    AdminNavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    BlogSidebarsComponent,
    ReactiveFormsModule,
    RouterModule 
  ],
  templateUrl: './edit-event-admin.component.html',
  styleUrls: ['./edit-event-admin.component.scss']
})
export class EditEventAdminComponent implements OnInit {
  eventId: number | null = null;
  eventForm!: FormGroup;
  eventTypes: string[] = Object.values(TypeEvent) as string[];

  constructor(
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.eventId || isNaN(this.eventId)) {
      console.error("Invalid Event ID from route.");
      return;
    }
    this.getEventDetails();
  }

  getEventDetails(): void {
    this.eventService.getEventById(this.eventId!).subscribe({
      next: (data) => {
        this.initForm(data);
      },
      error: (error) => {
        console.error('Error fetching event details:', error);
      }
    });
  }

  initForm(event: Event): void {
    this.eventForm = this.fb.group({
      title: [event.title, Validators.required],
      description: [event.description, Validators.required],
      dateTime: [this.formatDateTimeForInput(event.dateTime), Validators.required],
      location: [event.location, Validators.required],
      typeEvent: [event.typeEvent, Validators.required],
      reservationDate: [this.formatDateForInput(event.reservationDate), Validators.required]
    });
  }

  formatDateTimeForInput(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    ///const offset = date.getTimezoneOffset(); // Get local timezone offset in minutes
    //date.setMinutes(date.getMinutes());

    return date.toISOString().slice(0, 16); // Extracts "yyyy-MM-ddTHH:mm"
  }
  
  formatDateForInput(date: string): string {
    if (!date) return '';
  
    return new Date(date).toISOString().split('T')[0]; // Extracts "yyyy-MM-dd"
  }

  saveEvent(): void {
    if (this.eventForm.invalid) {
      return;
    }

    this.eventService.updateEvent(this.eventId!, this.eventForm.value).subscribe({
      next: () => {
        this.router.navigate(['/admin/events-admin']);
      },
      error: (error) => {
        console.error('Error updating event:', error);
      }
    });
  }

  close(): void {
    this.router.navigate(['/admin/events-admin']);
  }
}
