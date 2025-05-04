import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-formulaire-training',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    FormsModule
  ],
  templateUrl: './formulaire-training.component.html',
  styleUrls: ['./formulaire-training.component.scss']
})
export class FormulaireTrainingComponent {
  trainingRegistration: any = { 
    nom: '', 
    prenom: '', 
    adresse: '', 
    email: '', 
    telephone: '',
    trainingId: null
  };
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {}

  submitTrainingRegistration(): void {
    // Static validation
    if (!this.trainingRegistration.nom || !this.trainingRegistration.prenom || !this.trainingRegistration.adresse) {
      this.errorMessage = 'Veuillez remplir les champs obligatoires (Nom, Prénom et Adresse)';
      console.error(this.errorMessage);
      return;
    }

    // Simulate successful submission
    console.log('Training registration data:', this.trainingRegistration);
    this.successMessage = 'Registered';
    this.errorMessage = '';

    // Reset form
    this.trainingRegistration = { 
      nom: '', 
      prenom: '', 
      adresse: '', 
      email: '', 
      telephone: '',
      trainingId: null
    };

    // Delay redirection to show the message for 1.5 seconds
    setTimeout(() => {
      this.router.navigate(['/training-details']); 
    }, 1500);
  }
}