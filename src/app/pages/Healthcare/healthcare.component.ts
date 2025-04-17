import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HealthcareService } from '../../services/healthcare.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-healthcare',
  templateUrl: './healthcare.component.html',

  styleUrls: ['./healthcare.component.scss'],
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class HealthcareComponent implements OnInit {
  healthcareService = inject(HealthcareService);
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  sanitizer = inject(DomSanitizer);

  isRequester = false;
  isVolunteer = false;
  hasToken = false;

  healthcareList: any[] = [];
  selectedPatient: any = null;
  showVideo = false;
  loadingHealthcare = false;
  loadingNotifications = false;
  notificationMessage: string | null = null;
  notifications: any[] = [];

  healthcareForm!: FormGroup;
  doctorForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const roles = this.authService.getUserRoles();

    this.isRequester = roles.includes('ROLE_REFUGEE') || roles.includes('ROLE_ASSOCIATION_MEMBER');
    this.isVolunteer = roles.includes('ROLE_VOLUNTEER');
    this.initForms();
    
    if (this.hasToken) {
      if (this.isVolunteer) this.loadHealthcareList();
      if (this.isRequester) this.loadNotifications();
    }
  }

  initForms(): void {
    this.healthcareForm = this.fb.group({
      history: ['', [Validators.required, Validators.minLength(5)]],
      bookingDate: ['', Validators.required],
      symptoms: ['', Validators.required],
      disease: ['', Validators.required]
    });

    this.doctorForm = this.fb.group({
      idHealthcare: ['', Validators.required],
      disease: ['', Validators.required],
      treatmentPlan: ['', Validators.required],
      bookingDate: ['', Validators.required],
      status: ['IN_PROGRESS', Validators.required]
    });
  }

  loadHealthcareList(): void {
    this.loadingHealthcare = true;
    this.healthcareService.getAllHealthcare().subscribe((data) => {
      this.healthcareList = data;
      this.loadingHealthcare = false;
    });
  }

  loadNotifications(): void {
    this.loadingNotifications = true;
    this.healthcareService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loadingNotifications = false;
      },
      error: (err) => {
        this.loadingNotifications = false;
        console.error("❌ Erreur notifications :", err.message);
      }
    });
  }

  submitHealthcareRequest(): void {
    if (this.healthcareForm.valid) {
      const userId = this.authService.getUserId();
      const userName = this.authService.getUserName(); // assure-toi que cette méthode existe
  
      const data = {
        id: 0, // ou tu peux le laisser vide si le backend l'autogénère
        subscriberId: userId!,
        subscriberName: userName!,
        doctorId: 2, // à rendre dynamique si besoin
        history: this.healthcareForm.value.history!,
        symptoms: '', // à adapter selon ton modèle
        disease: '', // à adapter aussi
        terminalDisease: '',
        treatmentPlan: '',
        bookingDate: this.healthcareForm.value.bookingDate!,
        meetingUrl: '',
        status: 'PENDING' // ou la valeur initiale attendue
      };
  
      this.healthcareService.addHealthcare(data).subscribe(() => {
        this.healthcareForm.reset();
        this.loadHealthcareList();
      });
    }
  }
  

  selectPatient(patient: any): void {
    this.selectedPatient = patient;
    this.doctorForm.patchValue({
      idHealthcare: patient.idHealthcare,
      disease: patient.disease,
      treatmentPlan: patient.treatmentPlan,
      bookingDate: patient.bookingDate,
      status: patient.status
    });
    this.showVideo = false;
  }

  updateHealthcare(): void {
    if (!this.selectedPatient || this.doctorForm.invalid) {
      console.warn("⛔ Formulaire invalide ou patient non sélectionné.");
      return;
    }

    const updatedData = {
      id: this.doctorForm.value.idHealthcare,
      subscriberId: this.selectedPatient.subscriberId,
      subscriberName: this.selectedPatient.subscriberName || 'Inconnu',
      doctorId: 2,
      history: this.selectedPatient.history || '',
      symptoms: this.selectedPatient.symptoms || '',
      disease: this.doctorForm.value.disease,
      terminalDisease: this.doctorForm.value.disease,
      treatmentPlan: this.doctorForm.value.treatmentPlan,
      bookingDate: this.doctorForm.value.bookingDate,
      meetingUrl: this.selectedPatient.meetingUrl || '',
      status: this.doctorForm.value.status
    };

    console.log("📤 Mise à jour du soin envoyée :", updatedData);

    this.healthcareService.updateHealthcare(this.selectedPatient.idHealthcare, updatedData).subscribe({
      next: () => {
        this.notificationMessage = '✅ Soin mis à jour avec succès !';

        const patientId = this.selectedPatient.subscriberId;
        const hasMeeting = !!this.selectedPatient.meetingUrl;

        if (patientId) {
          this.notificationService.sendHealthcareNotification(patientId).subscribe();
          if (hasMeeting) {
            this.notificationService.sendVideoNotification(patientId).subscribe();
          }
        }

        this.loadHealthcareList();
        this.doctorForm.reset();
        this.selectedPatient = null;

        setTimeout(() => this.notificationMessage = null, 4000);
      },
      error: (err) => {
        console.error("❌ Erreur lors de la mise à jour du soin :", err);
        this.notificationMessage = '❌ Erreur lors de la mise à jour.';
        setTimeout(() => this.notificationMessage = null, 4000);
      }
    });
  }

  toggleVideo(): void {
    this.showVideo = !this.showVideo;
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
