import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // Added Router
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { AnimalService } from 'src/app/services/Animal.service';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';

@Component({
  selector: 'app-add-animals',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    AnimalService
  ],
  templateUrl: './add-animals.component.html',
  styleUrls: ['./add-animals.component.scss']
})
export class AddAnimalsComponent {
  newAnimal: any = { 
    name: '', 
    animalSpecies: '', 
    race: '', 
    medicalHistory: '', 
    isAdopted: false,
    subscriberId: 2 // Optional, set if needed
  };
  errorMessage = '';
  successMessage = '';

  constructor(
    private animalService: AnimalService,
    private router: Router // Added Router injection
  ) {}

  addAnimal(): void {
    if (!this.newAnimal.name || !this.newAnimal.animalSpecies) {
      this.errorMessage = 'Veuillez remplir les champs obligatoires (Nom et Espèce)';
      console.error(this.errorMessage);
      return;
    }

    const animalData = { ...this.newAnimal };
    console.log('Sending animal data to POST /api/animals/add:', animalData);

    this.animalService.addAnimal(animalData).subscribe({
      next: (response) => {
        console.log('Response from POST /api/animals/add:', response);
        const addedAnimal = response; // Expecting the animal object directly
        if (addedAnimal && addedAnimal.idAnimal) { // Check for idAnimal
          this.newAnimal = { 
            name: '', 
            animalSpecies: '', 
            race: '', 
            medicalHistory: '', 
            isAdopted: false,
            subscriberId: null 
          };
          this.successMessage = 'Animal ajouté avec succès !';
          this.errorMessage = '';
          // Redirect to /animals on successful submission
          this.router.navigate(['/animals']);
        } else {
          this.errorMessage = 'Ajout réussi mais réponse inattendue';
          console.warn('Unexpected response format:', response);
        }
      },
      error: (error) => {
        console.error('Error from POST /api/animals/add:', error.status, error.statusText, error.error);
        if (error.status === 200) {
          // Handle quirky 200 OK error case
          this.successMessage = 'Animal ajouté (statut OK mais traité comme erreur)';
          this.errorMessage = '';
          this.newAnimal = { 
            name: '', 
            animalSpecies: '', 
            race: '', 
            medicalHistory: '', 
            isAdopted: false,
            subscriberId: null 
          };
        } else {
          this.errorMessage = `Erreur: ${error.status || ''} - ${error.statusText || 'Inconnue'}`;
          this.successMessage = '';
        }
      },
      complete: () => {
        console.log('Add animal request completed');
      }
    });
  }
}