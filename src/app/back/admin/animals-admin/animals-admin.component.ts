import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { AnimalService, Animal } from 'src/app/services/Animal.service';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';

@Component({
  selector: 'app-animals-admin',
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
    AnimalService,
  ],
  templateUrl: './animals-admin.component.html',
  styleUrls: ['./animals-admin.component.scss'],
})
export class AnimalsAdminComponent implements OnInit {
  animals: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private animalService: AnimalService, private router: Router) {}

  ngOnInit(): void {
    this.loadAnimals();
  }

  loadAnimals(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.error =
        'Aucun token d’authentification trouvé. Veuillez vous connecter.';
      this.loading = false;
      return;
    }

    this.animalService.getAllAnimals().subscribe({
      next: (data: Animal[]) => {
        this.animals = data;
        this.loading = false;
        console.log('Animaux chargés:', this.animals);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des animaux:', error);
        this.error =
          'Erreur lors du chargement des animaux : ' +
          (error.message || 'Vérifiez la console');
        this.loading = false;
      },
    });
  }

  deleteAnimal(id: number | undefined): void {
    if (id === undefined) {
      this.error = 'ID de l’animal manquant';
      return;
    }
    if (confirm('Voulez-vous vraiment supprimer cet animal ?')) {
      this.animalService.deleteAnimal(id).subscribe({
        next: () => {
          this.animals = this.animals.filter(
            (animal) => animal.idAnimal !== id
          );
          console.log(`Animal ${id} supprimé avec succès`);
          this.error = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.error =
            'Erreur lors de la suppression de l’animal : ' +
            (error.message || 'Vérifiez la console');
        },
      });
    }
  }

  editAnimal(animal: Animal): void {
    this.router.navigate(['/admin/edit-animal', animal.idAnimal]); // À ajuster selon votre route d’édition
  }

  onAddAnimal(): void {
    this.router.navigate(['/admin/add-animals']);
  }

  viewAnimal(animal: Animal): void {
    this.router.navigate(['/admin/animal-profile', animal.idAnimal]);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'adopté':
        return 'success';
      case 'disponible':
        return 'warning';
      default:
        return 'secondary';
    }
  }
}
