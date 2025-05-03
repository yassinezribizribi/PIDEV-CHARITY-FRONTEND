import { CommonModule } from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  HttpErrorResponse,
} from '@angular/common/http';
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
    HttpClientModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    TrainingService,
  ],
  templateUrl: './training-details.component.html', // Changé à training-details.component.html
  styleUrl: './training-details.component.scss', // Changé à training-details.component.scss
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
  userId: any;
  ngOnInit(): void {
    this.userId = this.getUserIdFromToken();

    this.getTrainingDetails();
  }

  addsub(idTraining: number) {
    this.trainingService
      .addSubscriberToTraining(idTraining, this.userId)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.showModal('success');
        },
        error: (error: HttpErrorResponse) => {
          this.showModal('error');
        },
      });
  }

  private showModal(type: 'success' | 'error'): void {
    const modalId =
      type === 'success'
        ? 'trainingSubscribeModal'
        : 'trainingSubscribeErrorModal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modalElement);
      bootstrapModal.show();
    } else {
      console.error(`Modal with ID ${modalId} not found`);
    }
  }
}
