import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { EventService, Event } from 'src/app/services/event.service';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  templateUrl: './events-admin.component.html',
  styleUrls: ['./events-admin.component.scss'],
})
export class EventsAdminComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error: string | null = null;
  errorMessage = '';
  openajouter = false;
  isEditMode = false;
  currentEventId: number | null = null;
  eventForm!: FormGroup;

  constructor(private eventService: EventService, private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadEvents();
    this.initForm();
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (data: Event[]) => {
        this.events = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error loading events: ' + (error.message || 'Check the console');
        this.loading = false;
      },
    });
  }

  deleteEvent(id: number | undefined): void {
    if (id === undefined) {
      this.showModal('error');
      return;
    }
    this.showModal('confirm', id);
  }
  
  private confirmDeleteEvent(id: number): void {
    this.eventService.deleteEvent(id).subscribe({
      next: () => {
        this.events = this.events.filter((event) => event.idEvent !== id);
        console.log(`Événement ${id} supprimé avec succès`);
        this.error = null;
        this.showModal('success');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erreur lors de la suppression:', error);
        this.error = 'Error deleting event: ' + (error.message || 'Check the console');
        this.showModal('error');
      }
    });
  }
  
  private showModal(type: 'success' | 'error' | 'confirm', id?: number): void {
    const modalId =
      type === 'success'
        ? 'eventDeleteModal'
        : type === 'error'
          ? 'eventDeleteErrorModal'
          : 'eventDeleteConfirmModal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modalElement);
      if (type === 'confirm' && id !== undefined) {
        // Attach confirm action to the modal's confirm button
        const confirmButton = modalElement.querySelector('.confirm-delete-btn');
        if (confirmButton) {
          // Remove existing listeners to prevent multiple bindings
          const newConfirmButton = confirmButton.cloneNode(true);
          confirmButton.parentNode?.replaceChild(newConfirmButton, confirmButton);
          newConfirmButton.addEventListener('click', () => {
            this.confirmDeleteEvent(id);
            bootstrapModal.hide();
          });
        }
      }
      bootstrapModal.show();
    } else {
      console.error(`Modal with ID ${modalId} not found`);
    }
  }

  initForm(event?: Event): void {
    this.isEditMode = !!event;
    this.currentEventId = event ? event.idEvent : null;

    this.eventForm = this.fb.group({
      title: [event?.title || '', Validators.required],
      description: [event?.description || '', Validators.required],
      dateTime: [event?.dateTime || '', Validators.required],
      location: [event?.location || '', Validators.required],
      typeEvent: [event?.typeEvent || '', Validators.required],
      reservationDate: [event?.reservationDate || '', Validators.required]
    });
  }

  formatDateTimeForInput(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const offset = date.getTimezoneOffset(); // Get local timezone offset in minutes
    date.setMinutes(date.getMinutes()-60);

    return date.toISOString().slice(0, 16); // Extracts "yyyy-MM-ddTHH:mm"
  }

  resetForm(): void {
    this.isEditMode = false;
    this.currentEventId = null;
    this.eventForm.reset();
  }

  close(): void {
    this.resetForm();
    this.openajouter = false;
  }

  updateEvent(id: number, eventData: any): void {
    this.eventService.updateEvent(id, eventData).subscribe(() => {
      this.loadEvents();
      this.close();
    });
  }
  onAddEvent(): void {
    this.router.navigate(['/admin/add-event']);
  }

  editEvent(event: Event): void {
    this.initForm(event);
    this.openajouter = true;
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      return;
    }

    const eventData = this.eventForm.value;

    if (this.isEditMode) {
      this.updateEvent(this.currentEventId!, eventData);
    } else {
      this.addEvent(eventData);
    }
  }

  addEvent(eventData: any): void {
    this.eventService.addEvent(eventData).subscribe(() => {
      this.loadEvents();
      this.close();
    });
  }

  getStatusClass(typeEvent: string): string {
    switch (typeEvent.toLowerCase()) {
      case 'conference':
        return 'success';
      case 'workshop':
        return 'warning';
      default:
        return 'secondary';
    }
  }
}
