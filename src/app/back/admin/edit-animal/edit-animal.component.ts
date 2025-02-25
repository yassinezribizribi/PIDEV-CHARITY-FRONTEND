import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { AnimalService, Animal } from 'src/app/services/Animal.service';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';

@Component({
  selector: 'app-edit-animal',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NavbarComponent,
    AdminNavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule,
    BlogSidebarsComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    AnimalService
  ],
  templateUrl: './edit-animal.component.html',
  styleUrls: ['./edit-animal.component.scss']
})
export class EditAnimalComponent implements OnInit {
  animalForm: FormGroup;
  loading = true;
  error: string | null = null;
  animalId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private animalService: AnimalService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.animalForm = this.fb.group({
      name: ['', Validators.required],
      animalSpecies: ['', Validators.required],
      race: ['', Validators.required],
      medicalHistory: [''],
      isAdopted: [false],
      subscriberId: [null]
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.error = 'Aucun token d’authentification trouvé. Veuillez vous connecter.';
      this.loading = false;
      return;
    }

    this.animalId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.animalId) {
      this.loadAnimalData();
    } else {
      this.error = 'ID de l’animal invalide';
      this.loading = false;
    }
  }

  loadAnimalData(): void {
    if (this.animalId) {
      this.animalService.getAnimalById(this.animalId).subscribe({
        next: (animal: Animal) => {
          this.animalForm.patchValue({
            name: animal.name,
            animalSpecies: animal.animalSpecies,
            race: animal.race,
            medicalHistory: animal.medicalHistory,
            isAdopted: animal.isAdopted,
            subscriberId: animal.subscriberId
          });
          this.loading = false;
          console.log('Animal chargé:', animal);
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l’animal:', error);
          this.error = 'Erreur lors du chargement de l’animal : ' + (error.message || 'Vérifiez la console');
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.animalForm.invalid || !this.animalId) {
      this.error = 'Formulaire invalide ou ID manquant';
      return;
    }

    const updatedAnimal: Animal = this.animalForm.value;
    this.animalService.updateAnimal(this.animalId, updatedAnimal).subscribe({
      next: (response: Animal) => {
        console.log('Animal mis à jour avec succès:', response);
        this.router.navigate(['/animals-admin']);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.error = 'Erreur lors de la mise à jour de l’animal : ' + (error.message || 'Vérifiez la console');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/animals-admin']);
  }
}