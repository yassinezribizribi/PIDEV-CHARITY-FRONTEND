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
  userEmail: string | undefined;
  telephone: string | undefined;
  isLoading = true;
  errorMessage = '';

  constructor(
    private animalService: AnimalService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getAnimalDetails();
    if (this.animal?.subscriberId) {  // Check if subscriberId is defined and not undefined
      this.getUserById(this.animal.subscriberId); // Use animal's subscriberId
    }
  }

  getAnimalDetails(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.isLoading = true;
      this.animalService.getAnimalById(id).subscribe({
        next: (data) => {
          this.animal = data;
          this.isLoading = false;
          console.log('Animal details fetched:', data);

          // After animal details are fetched, call getUserById
          if (this.animal?.subscriberId) {
            this.getUserById(this.animal.subscriberId); // Call with the actual subscriberId
          }
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


  getUserById(id: number): void {
    this.animalService.getUserById(id).subscribe({
      next: (data) => {
        console.log('User details fetched:', data); // Check the response
        this.userEmail = data.email; // Assign fetched user's email
        this.telephone = data.telephone; // Assign fetched user

      },
      error: (error) => {
        console.error('Error fetching user details:', error);
      }
    });
  }

}