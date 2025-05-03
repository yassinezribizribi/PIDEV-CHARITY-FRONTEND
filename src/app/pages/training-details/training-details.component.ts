import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { TrainingService } from '../../services/training.service';
import { TokenInterceptor } from '../../interceptors/token.interceptor';
import { ActivatedRoute } from '@angular/router';
import { Training } from 'src/app/models/Training';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-training-details', // Changé de training-detail à training-details
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
  templateUrl: './training-details.component.html', // Changé à training-details.component.html
  styleUrl: './training-details.component.scss' // Changé à training-details.component.scss
})
export class TrainingDetailsComponent implements OnInit {
 // Changé à TrainingDetailsComponent
  training: any | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private trainingService: TrainingService,
    private route: ActivatedRoute
  ) {}
  userId:any
  ngOnInit(): void {
    this.userId = this.getUserIdFromToken();

    
    this.getTrainingDetails();
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
  getTrainingDetails(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.isLoading = true;
      this.trainingService.getTrainingById(id).subscribe({
        next: (data) => {
          this.training = data;
          this.isLoading = false;
          console.log('Training details fetched:', data);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error fetching training details:', error);
          this.errorMessage = 'Erreur lors de la récupération des détails de la formation';
        }
      });
    } else {
      this.isLoading = false;
      this.errorMessage = 'ID de la formation invalide';
    }
  }
  addsub(idTraining:number) {
this.trainingService.addSubscriberToTraining(idTraining,this.userId).subscribe((data:any)=>{
  console.log(data);
  alert("register successfully ")
  
},(error:HttpErrorResponse)=>{
  alert("L'abonné est déjà inscrit à cette formation")
  
})
  }
}