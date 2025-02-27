import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';  // Import HttpClient here
import { AuthService } from '../../services/auth.service';  // Import AuthService
import { CrisisService } from '../../services/crisis.service';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule], // ✅ Ajout du module ici
  standalone: true, // ✅ Assurez-vous que c'est bien activé
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  crisisForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  userId: string | null = localStorage.getItem('userId'); // ✅ Récupération de l'ID utilisateur

  constructor(
    private fb: FormBuilder, 
    private crisisService: CrisisService,
    private httpClient: HttpClient, // Inject HttpClient here
    private authService: AuthService // Inject AuthService here
  ) {
    this.crisisForm = this.fb.group({
      category: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      crisis_date: ['', Validators.required],
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
    this.httpClient.post('http://localhost:8089/api/crises/add', crisisData, {
        headers: this.authService.getAuthHeaders()
     }).subscribe(
        response => {
           console.log('Crisis sent successfully:', response);
           this.successMessage = 'Crisis reported successfully!';
           this.errorMessage = null;
           setTimeout(() => {
             this.successMessage = null; // Hide success message after 5 seconds
           }, 5000); // Timeout for the success message
        },
        error => {
           console.error('Error sending crisis:', error);
           console.log('Full error response:', error); // Log the entire error
           this.errorMessage = `Error: ${error.status} ${error.statusText}`;
           this.successMessage = null;
           setTimeout(() => {
             this.errorMessage = null; // Hide error message after 5 seconds
           }, 5000); // Timeout for the error message
        }
     );
  }
}
