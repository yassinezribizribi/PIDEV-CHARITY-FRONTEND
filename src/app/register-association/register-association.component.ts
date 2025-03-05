// register-association.component.ts
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { AssociationService } from 'src/app/services/association.service';
import { Association, AssociationStatus } from '../interfaces/association.interface';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register-association',
  standalone: true,
  templateUrl: './register-association.component.html',
  styleUrls: ['./register-association.component.scss'],
  imports: [FooterComponent, NavbarComponent, RouterLink, FormsModule, CommonModule]
})
export class RegisterAssociationComponent {
  @ViewChild('associationForm') associationForm!: NgForm;

  association: Association = {
    idAssociation: 0,
    associationName: '',
    associationAddress: '',
    description: '',
    associationLogoPath: null,
    registrationDocumentPath: null,
    legalDocumentPath: null,
    status: AssociationStatus.PENDING
  };

  isSubmitting = false;
  submissionSuccess = false;
  submissionError = false;
  submitted = false;
  errorMessage = '';
  logoError: string | null = null;
  registrationDocError: string | null = null;
  legalDocError: string | null = null;
  registrationDocumentTouched = false;
  legalDocumentTouched = false;

  constructor(
    private associationService: AssociationService,
    private httpClient: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  onFileChange(event: any, field: 'associationLogoPath' | 'registrationDocumentPath' | 'legalDocumentPath') {
    const file = event.target.files[0];
    
    if (field === 'registrationDocumentPath') this.registrationDocumentTouched = true;
    if (field === 'legalDocumentPath') this.legalDocumentTouched = true;

    if (file) {
      let error: string | null = null;
      const maxSize = 5 * 1024 * 1024; // 5MB

      switch (field) {
        case 'associationLogoPath':
          if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            error = 'Invalid file type. Please upload a PNG, JPG, or JPEG image.';
          } else if (file.size > maxSize) {
            error = 'File size must be less than 5MB.';
          }
          this.logoError = error;
          break;
        case 'registrationDocumentPath':
          if (file.type !== 'application/pdf') {
            error = 'Invalid file type. Please upload a PDF.';
          } else if (file.size > maxSize) {
            error = 'File size must be less than 5MB.';
          }
          this.registrationDocError = error;
          break;
        case 'legalDocumentPath':
          if (file.type !== 'application/pdf') {
            error = 'Invalid file type. Please upload a PDF.';
          } else if (file.size > maxSize) {
            error = 'File size must be less than 5MB.';
          }
          this.legalDocError = error;
          break;
      }

      if (!error) {
        this.association[field] = file;
      } else {
        this.association[field] = null;
        event.target.value = ''; // Clear invalid file
      }
    }
  }

  areFilesValid(): boolean {
    const registrationValid = !!this.association.registrationDocumentPath && !this.registrationDocError;
    const legalValid = !!this.association.legalDocumentPath && !this.legalDocError;
    const logoValid = !this.association.associationLogoPath || !this.logoError;

    return registrationValid && legalValid && logoValid;
  }

  onSubmit() {
    this.submitted = true;
    this.isSubmitting = true;
    this.submissionSuccess = false;
    this.submissionError = false;
    this.errorMessage = '';

    // Check form validity
    if (!this.associationForm.form.valid || !this.areFilesValid()) {
      this.isSubmitting = false;
      return;
    }

    // Check required files
    if (!this.association.registrationDocumentPath) {
      this.registrationDocError = 'Registration document is required.';
      this.isSubmitting = false;
      return;
    }
    if (!this.association.legalDocumentPath) {
      this.legalDocError = 'Legal document is required.';
      this.isSubmitting = false;
      return;
    }

    const formData = new FormData();
    formData.append('associationName', this.association.associationName);
    formData.append('associationAddress', this.association.associationAddress);
    formData.append('description', this.association.description);
    formData.append('status', this.association.status);

    if (this.association.associationLogoPath) {
      formData.append('associationLogo', this.association.associationLogoPath);
    }
    formData.append('registrationDocument', this.association.registrationDocumentPath);
    formData.append('legalDocument', this.association.legalDocumentPath);

    const headers = this.authService.getAuthHeaders();

    this.httpClient.post('http://localhost:8089/api/associations', formData, { headers })
      .subscribe({
        next: (response) => {
          this.submissionSuccess = true;
          this.router.navigate(['/association/account']);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating association:', error);
          this.submissionError = true;
          this.errorMessage = error.error?.message || 'There was an error while submitting the form. Please try again.';
          this.isSubmitting = false;
        }
      });
  }
}