import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { AnimalService, Animal } from '../../services/Animal.service';
import { TokenInterceptor } from '../../interceptors/token.interceptor';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-animal-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    BlogSidebarsComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    AnimalService
  ],
  templateUrl: './animal-profile.component.html',
  styleUrl: './animal-profile.component.scss'
})
export class AnimalProfileComponent implements OnInit {
  animal: Animal | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private animalService: AnimalService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getAnimalDetails();
  }

  getAnimalDetails(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')); // Récupère l'ID depuis l'URL
    if (id) {
      this.isLoading = true;
      this.animalService.getAnimalById(id).subscribe({
        next: (data) => {
          this.animal = data;
          this.isLoading = false;
          console.log('Animal details fetched:', data);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error fetching animal details:', error);
          this.errorMessage = 'Erreur lors de la récupération des détails de l’animal';
        }
      });
    } else {
      this.isLoading = false;
      this.errorMessage = 'ID de l’animal invalide';
    }
  }
}