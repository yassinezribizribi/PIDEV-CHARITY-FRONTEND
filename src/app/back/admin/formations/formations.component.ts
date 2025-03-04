import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Training } from 'src/app/models/Training';
import { TrainingService } from 'src/app/services/training.service';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { FooterComponent } from '@component/footer/footer.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-formations',
  imports: [ReactiveFormsModule,CommonModule,AdminNavbarComponent,ScrollToTopComponent,FooterComponent,RouterLink],
  templateUrl: './formations.component.html',
  styleUrl: './formations.component.css'
})
export class FormationsComponent  implements OnInit {
  trainings: any = [];
  training:any;
  errorMessage = '';
  isLoading = true;
  trainingForm!: FormGroup;
  isEditMode: boolean = false;
  currentTrainingId: number | null = null;
  openajouter:boolean=false
  isAffected: boolean = false; 
  constructor(
    private trainingService: TrainingService,
    private router: Router,
    private modalService : NgbModal,
    private fb: FormBuilder
  ) {}
  selectedTrainingId: number | null = null; // Stocke l'ID de la formation sélectionnée
  toggleSubscribers(trainingId: number) {
    // Si la formation est déjà sélectionnée, on la masque
    if (this.selectedTrainingId === trainingId) {
      this.selectedTrainingId = null;
    } else {
      this.selectedTrainingId = trainingId;
    }
  }
  ngOnInit(): void {
    this.getAllTrainings();
    this.initForm();
  }

  

  initForm(training?: Training): void {
    this.isEditMode = !!training;
    this.currentTrainingId = training ? training.idTraining : null;

    this.trainingForm = this.fb.group({
    

      trainingName: [training?.trainingName || '', Validators.required],
      description: [training?.description || '', Validators.required],
      duration: [training?.duration || '', [Validators.required, Validators.min(1)]],
      capacity: [training?.capacity || '', [Validators.required, Validators.min(1)]],
      level: [training?.level || '', Validators.required],
      type: [training?.type || '', Validators.required],
      sessionDate: [training?.sessionDate || '', [Validators.required]]
    });
  }

  getAllTrainings(): void {
    this.isLoading = true;
    this.trainingService.getAllTrainings().subscribe({
      next: (data) => {
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

  // ymodifier w yeziid
  onSubmit(): void {
    if (this.trainingForm.invalid) {
      return;
    }

    const trainingData = this.trainingForm.value;
      //  hnee  format yyyy-mm-dd
  const formattedDate = this.formatDate(trainingData.sessionDate);
  trainingData.sessionDate = formattedDate;
    if (this.isEditMode) {
      this.updateTraining(this.currentTrainingId!, trainingData);
    } else {
      this.addTraining(trainingData);
    }
  }
  formatDate(date: string): string {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = ('0' + (formattedDate.getMonth() + 1)).slice(-2); // Mois commence à 0
    const day = ('0' + formattedDate.getDate()).slice(-2);
  
    return `${year}-${month}-${day}`;
  }
  addTraining(trainingData: any): void {
    this.trainingService.addTraining(trainingData).subscribe((training) => {
      console.log('Formation ajoutée :', training);
      this.getAllTrainings();
      this.resetForm();
    });
  }

  updateTraining(id: number, trainingData: any): void {
    this.trainingService.updateTraining(id, trainingData).subscribe((updatedTraining) => {
      console.log('Formation mise à jour :', updatedTraining);
      this.getAllTrainings();
      this.close()
    });
  }

  deleteTraining(id: number): void {
    this.trainingService.deleteTraining(id).subscribe(() => {
      console.log('Formation supprimée');
      this.getAllTrainings();
    });
  }

  resetForm(): void {
    this.isEditMode = false;
    this.currentTrainingId = null;
    this.trainingForm.reset();
  }
  close(){
    this.resetForm()
    this.openajouter=false
  }

  editTraining(training: Training): void {
    this.initForm(training);
    this.openajouter=true
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

affectToTrain(): void {
  this.isAffected = !this.isAffected; // Toggle the state
}


      addSubToTrain(trainingId: number): void {
        const idUser = this.getUserIdFromToken(); // Get user ID from token
      
        if (!idUser) { // Use the local variable instead of this.idUser
          console.error("User ID is missing.");
          return;
        }
      
        this.trainingService.addSubscriberToTraining(trainingId, idUser).subscribe({
          next: (updatedTraining) => {
            console.log("User subscribed successfully:", updatedTraining);
          },
          error: (error) => {
            console.error("Error subscribing to training:", error);
          }
        });
      }
      
}