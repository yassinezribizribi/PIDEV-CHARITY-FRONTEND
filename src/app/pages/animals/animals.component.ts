import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { AnimalService } from 'src/app/services/Animal.service';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule,
    BlogSidebarsComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    AnimalService
  ],
  templateUrl: './animals.component.html',
  styleUrls: ['./animals.component.scss']
})
export class AnimalsComponent implements OnInit {
  animals: any[] = [];
  errorMessage = '';
  currentPage = 1; // Page courante
  animalsPerPage = 6; // 6 animaux par page
  totalPages = 1; // Nombre total de pages

  constructor(private animalService: AnimalService) {}

  ngOnInit(): void {
    this.getNonAdoptedAnimals();
  }

  getNonAdoptedAnimals(): void {
    this.animalService.getNonAdoptedAnimals().subscribe({
      next: (data) => {
        this.animals = data;
        this.totalPages = Math.ceil(this.animals.length / this.animalsPerPage); // Calculer le nombre total de pages
        console.log('Non-adopted animals fetched:', data);
      },
      error: (error) => {
        console.error('Error fetching non-adopted animals:', error);
        this.errorMessage = 'Erreur lors de la récupération des animaux non adoptés';
      }
    });
  }

  deleteAnimal(id: number): void {
    this.animalService.deleteAnimal(id).subscribe({
      next: () => {
        this.animals = this.animals.filter(animal => animal.idAnimal !== id);
        this.totalPages = Math.ceil(this.animals.length / this.animalsPerPage); // Mettre à jour le nombre de pages
        console.log(`Animal ${id} deleted`);
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error deleting animal:', error);
        this.errorMessage = 'Erreur lors de la suppression';
      }
    });
  }

  // Obtenir les animaux de la page courante
  get paginatedAnimals(): any[] {
    const startIndex = (this.currentPage - 1) * this.animalsPerPage;
    return this.animals.slice(startIndex, startIndex + this.animalsPerPage);
  }

  // Changer de page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}