import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { TrainingService } from '../../services/training.service';
import { TokenInterceptor } from '../../interceptors/token.interceptor';
import { Router } from '@angular/router';
import { Training } from 'src/app/models/Training';

@Component({
  selector: 'app-training',
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
    TrainingService
  ],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss'
})
export class TrainingComponent implements OnInit {  // Changé de TrainingListComponent à TrainingComponent
  trainings: Training[] = [];
  errorMessage = '';
  isLoading = true;

  constructor(private trainingService: TrainingService, private router: Router) {}

  ngOnInit(): void {
    this.getAllTrainings();
  }

  getAllTrainings(): void {
    this.isLoading = true;
    this.trainingService.getAllTrainings().subscribe({
      next: (data:any) => {
        this.trainings = data;
        this.isLoading = false;
        console.log('Trainings fetched:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching trainings:', error);
        this.errorMessage = 'Erreur lors de la récupération des formations';
      }
    });
  }

  goToTrainingDetails(id: number): void {
    this.router.navigate(['/trainings', id]);
  }
}