import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { EventService } from 'src/app/services/event.service'; // Kept for consistency, not used yet

@Component({
  selector: 'app-formulaire-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    FormsModule
  ],
  providers: [EventService], // Provided for future use
  templateUrl: './formulaire-events.component.html',
  styleUrls: ['./formulaire-events.component.scss']
})
export class FormulaireEventsComponent {
  attendance: any = { 
    nom: '', // Last name
    prenom: '', // First name
    adresse: '', // Address
    email: '', // Optional email field
    telephone: '', // Optional phone number
    eventId: null // Optional event ID for future linking
  };
  errorMessage = '';
  successMessage = '';

  constructor(
    private eventService: EventService, // Included for future use
    private router: Router
  ) {}

  submitAttendance(): void {
    // Static validation
    if (!this.attendance.nom || !this.attendance.prenom || !this.attendance.adresse) {
      this.errorMessage = 'Veuillez remplir les champs obligatoires (Nom, Prénom et Adresse)';
      console.error(this.errorMessage);
      return;
    }

    // Simulate successful submission (static behavior)
    console.log('Attendance data:', this.attendance);
    this.successMessage = 'Inscription à l\'événement enregistrée avec succès ! (Simulation)';
    this.errorMessage = '';

    // Reset form
    this.attendance = { 
      nom: '', 
      prenom: '', 
      adresse: '', 
      email: '', 
      telephone: '',
      eventId: null
    };
    setTimeout(() => {
      this.router.navigate(['/blog-sidebar']);
    }, 1500); // 1500ms = 1.5 seconds
  }
}