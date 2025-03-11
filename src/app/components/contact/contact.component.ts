import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';  // Import HttpClient here
import { AuthService } from '../../services/auth.service';  // Import AuthService
import { CrisisService } from '../../services/crisis.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
export enum Categorie {
  NATURAL_DISASTER = 'NATURAL_DISASTER',
  FOOD_STORAGE = 'FOOD_STORAGE',
  PANDEMIC = 'PANDEMIC',
  MEDICAL_STORAGE = 'MEDICAL_STORAGE'
}
@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule,CommonModule], // ✅ Ajout du module ici
  standalone: true, // ✅ Assurez-vous que c'est bien activé
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  categories = Object.values(Categorie); // Convertit l'Enum en tableau utilisable

  crisisForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  userId: string | null = localStorage.getItem('userId'); // ✅ Récupération de l'ID utilisateur

  constructor(
    private fb: FormBuilder, 
    private crisisService: CrisisService,
    private httpClient: HttpClient, // Inject HttpClient here
    private authService: AuthService, // Inject AuthService here
    private toastr: ToastrService
  ) {
    this.crisisForm = this.fb.group({
      categorie: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      crisisDate: ['', Validators.required],
      updates: [''],
      subscriber_id_user: [this.userId || ''] // ✅ Initialisé avec l'ID actuel mais modifiable
    });
  }

  ngOnInit(): void {}

  sendCrisis() {
    if (this.crisisForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const crisisData = this.crisisForm.value;  // Get data from the form
    console.log(crisisData)
    this.httpClient.post('http://localhost:8089/api/crises/add', crisisData, {
        headers: this.authService.getAuthHeaders()
     }).subscribe(
        response => {
           console.log('Crisis sent successfully:', response);
           this.successMessage = 'Crisis reported successfully!';
           this.toastr.success('Crisis sent successfully', 'successful!');
           this.crisisForm.reset();

           this.errorMessage = null;
           setTimeout(() => {
             this.successMessage = null; // Hide success message after 5 seconds
           }, 5000); // Timeout for the success message
        },
        error => {
           console.error('Error sending crisis:', error);
           console.log('Full error response:', error); // Log the entire error
           this.errorMessage = `Error: ${error.status} ${error.statusText}`;
           this.toastr.error('Crisis not send', 'OOups!');
           this.successMessage = null;
           setTimeout(() => {
             this.errorMessage = null; // Hide error message after 5 seconds
           }, 5000); // Timeout for the error message
        }
     );
  }
}