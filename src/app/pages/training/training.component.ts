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
import { jwtDecode } from 'jwt-decode';

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
  mytrainings: Training[] = [];
  errorMessage = '';
  isLoading = true;

  constructor(private trainingService: TrainingService, private router: Router) {}
userId: number | null = null;
  ngOnInit(): void {
    this.userId=this.getUserIdFromToken()
    this.getAllTrainings();
   
  }
open:boolean=false
  toggle() {
    this.open=!this.open
    if (this.open == true) {
      this.mytraining()
    }else
    {this.getAllTrainings()}
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
  downloadCertificate(idformation:any){
    this.trainingService.downloadCertificate(idformation,this.userId!)
      .subscribe(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `certificat_${this.userId!}.pdf`;
            link.click();
          });
      }
  mytraining(): void {
    this.isLoading = true;
    this.trainingService.getTrainingsBySubscriber(this.userId!).subscribe({
      next: (data:any) => {
        this.mytrainings = data;
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
   getUserIdFromToken(): number | null {
        const token = localStorage.getItem('auth_token');
        console.log("token:", token);
        
        if (!token) return null;
      
        try {
          const decodedToken: any = jwtDecode(token);
          return decodedToken.idUser;
        } catch (error) {
          console.error("Error decoding token:", error);
          return null;
        }
      }
}