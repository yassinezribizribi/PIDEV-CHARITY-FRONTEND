import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { AnimalService } from 'src/app/services/Animal.service';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';
import { jwtDecode } from 'jwt-decode';

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
    ReactiveFormsModule // Importation de ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    AnimalService
  ],
  templateUrl: './add-animals.component.html',
  styleUrls: ['./add-animals.component.scss']
})
export class AddAnimalsComponent {
  animalForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder, // FormBuilder pour initialiser les formulaires
    private animalService: AnimalService,
    private router: Router
  ) {
    this.animalForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      animalSpecies: ['', Validators.required],
      race: ['', Validators.required],
      medicalHistory: ['',Validators.required],
      isAdopted: [false]
    });
  }

  // Récupération du userId depuis le token JWT
  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.idUser;
    } catch (error) {
      console.error("Erreur de décodage du token:", error);
      return null;
    }
  }
  selectedImageFile: File | null = null;

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
    }
  }
  
  addAnimal(): void {
    if (this.animalForm.invalid) {
      this.errorMessage = "Veuillez remplir correctement tous les champs requis.";
      return;
    }
  
    const userId = this.getUserIdFromToken();
    if (!userId) {
      this.errorMessage = "Utilisateur non identifié.";
      return;
    }
  
    const formData = new FormData();
  
    const animalData = {
      name: this.animalForm.value.name,
      animalSpecies: this.animalForm.value.animalSpecies,
      race: this.animalForm.value.race,
      medicalHistory: this.animalForm.value.medicalHistory,
      isAdopted: this.animalForm.value.isAdopted,
      healthcare: this.animalForm.value.healthcare
    };
  
    formData.append('animal', new Blob([JSON.stringify(animalData)], { type: 'application/json' }));
  
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }
  
    formData.append('iduser', userId.toString());
  
    this.animalService.addAnimal(formData).subscribe({
      next: (response) => {
        console.log('Réponse API:', response);
        this.successMessage = 'Animal ajouté avec succès !';
        this.errorMessage = '';
        this.animalForm.reset();
        this.router.navigate(['/animals']);
      },
      error: (error) => {
        console.error('Erreur API:', error);
        this.errorMessage = `Erreur: ${error.status || ''} - ${error.statusText || 'Inconnue'}`;
        this.successMessage = '';
      },
      complete: () => {
        console.log('Ajout de l’animal terminé.');
      }
    });
  }
  
}
