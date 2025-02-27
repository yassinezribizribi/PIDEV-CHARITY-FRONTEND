import { Component, OnInit, inject } from '@angular/core';
import { HealthcareService } from '../../services/healthcare.service';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-healthcare',
  templateUrl: './healthcare.component.html',
  styleUrls: ['./healthcare.component.scss'],
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class HealthcareComponent implements OnInit {
  healthcareService = inject(HealthcareService);
  authService = inject(AuthService);

  healthcareList: any[] = []; // ✅ Liste des soins
  selectedPatient: any = null; // ✅ Patient sélectionné

  isRequester = false; // ✅ Association Member et Refugee peuvent envoyer une demande
  isVolunteer = false; // ✅ Volunteer peut voir et traiter les demandes
  hasToken = false; // ✅ Vérification de connexion utilisateur

  healthcareForm = new FormGroup({
    history: new FormControl('', [Validators.required, Validators.minLength(5)]),
    bookingDate: new FormControl('', [Validators.required])
  });

  doctorForm = new FormGroup({
    idHealthcare: new FormControl(null, [Validators.required]),
    treatmentPlan: new FormControl('', [Validators.required]),
    terminalDisease: new FormControl('', [Validators.required]),
    bookingDate: new FormControl('', [Validators.required]),
    status: new FormControl('IN_PROGRESS', [Validators.required])
  });

  constructor() {}

  ngOnInit(): void {
    this.checkUserRole();
    if (this.isVolunteer && this.hasToken) {
      this.loadHealthcareList(); // Charger la liste des soins
    }
  }

  // ✅ Vérifier le rôle de l'utilisateur et la connexion
  checkUserRole(): void {
    const token = this.authService.getToken(); // Vérifier si un token est présent
    this.hasToken = !!token;

    if (!this.hasToken) {
      console.warn("⚠️ L'utilisateur n'est pas connecté !");
      return;
    }

    const userRole = this.authService.getUserRole();

    // ✅ Refugee et Association Member peuvent envoyer une demande
    this.isRequester = userRole === 'ROLE_REFUGEE' || userRole === 'ROLE_ASSOCIATION_MEMBER';

    // ✅ Volunteer peut voir et traiter les demandes
    this.isVolunteer = userRole === 'ROLE_VOLUNTEER';

    console.log("👤 Rôle détecté :", userRole, "| Requester:", this.isRequester, "| Volunteer:", this.isVolunteer);
  }

  // ✅ Charger la liste des soins des patients
  loadHealthcareList(): void {
    console.log("🔍 Chargement des patients...");
    this.healthcareService.getAllHealthcare().subscribe({
        next: (data) => {
            console.log("✅ Données API :", data); // 🔥 DEBUG

            // Si vide, afficher un message
            if (!data || data.length === 0) {
                console.warn("⚠️ Aucun patient trouvé !");
            }

            // Formatage correct
            this.healthcareList = data.map(item => ({
                idHealthcare: item.idHealthcare,
                subscriberName: item.subscriber
                    ? `${item.subscriber.firstName} ${item.subscriber.lastName}`
                    : 'Non spécifié',
                symptoms: item.history || 'Aucun symptôme indiqué',
                bookingDate: item.bookingDate || 'Non précisé',
                status: item.status || 'PENDING'
            }));

            console.log("✅ Liste finale :", this.healthcareList); // 🔥 DEBUG
        },
        error: (error) => {
            console.error("❌ Erreur API :", error);
        }
    });
}


  // ✅ Sélectionner un patient et charger ses données
  selectPatient(patient: any): void {
    this.selectedPatient = patient;
    console.log("👤 Patient sélectionné :", this.selectedPatient);

    // ✅ Pré-remplir le formulaire pour traitement
    this.doctorForm.patchValue({
      idHealthcare: patient.idHealthcare,
      treatmentPlan: patient.treatmentPlan || '',
      terminalDisease: patient.terminalDisease || '',
      bookingDate: patient.bookingDate
    });
  }

  // ✅ Soumettre une demande de soin (Refugee ou Association Member)
  submitHealthcareRequest(): void {
    if (!this.hasToken) {
      alert("⚠️ Vous devez être connecté pour envoyer une demande !");
      return;
    }

    if (this.healthcareForm.valid) {
      const healthcareData = { 
        history: this.healthcareForm.value.history,
        bookingDate: this.healthcareForm.value.bookingDate,
        subscriberId: this.authService.getUserId()
      };

      this.healthcareService.addHealthcare(healthcareData).subscribe({
        next: () => { 
          alert("✅ Demande envoyée avec succès !");
          this.healthcareForm.reset();
          this.loadHealthcareList();
        },
        error: (error) => { console.error("❌ Erreur lors de l'ajout:", error); }
      });
    }
  }

  // ✅ Mettre à jour le traitement du patient
  updateHealthcare(): void {
    if (!this.hasToken) {
      alert("⚠️ Vous devez être connecté pour modifier un soin !");
      return;
    }

    if (this.doctorForm.valid) {
      this.healthcareService.updateHealthcare(this.doctorForm.value.idHealthcare!, this.doctorForm.value).subscribe({
        next: () => {
          alert("✅ Traitement mis à jour !");
          this.loadHealthcareList();
        },
        error: (error) => console.error("❌ Erreur lors de la mise à jour:", error)
      });
    }
  }
}
