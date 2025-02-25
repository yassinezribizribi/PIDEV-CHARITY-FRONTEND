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

  constructor(private animalService: AnimalService) {}

  ngOnInit(): void {
    this.getAllAnimals();
  }

  getAllAnimals(): void {
    this.animalService.getAllAnimals().subscribe({
      next: (data) => {
        this.animals = data;
        console.log('Animals fetched:', data);
      },
      error: (error) => {
        console.error('Error fetching animals:', error);
        this.errorMessage = 'Erreur lors de la récupération des animaux';
      }
    });
  }

  deleteAnimal(id: number): void {
    this.animalService.deleteAnimal(id).subscribe({
      next: () => {
        this.animals = this.animals.filter(animal => animal.idAnimal !== id);
        console.log(`Animal ${id} deleted`);
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error deleting animal:', error);
        this.errorMessage = 'Erreur lors de la suppression';
      }
    });
  }
}