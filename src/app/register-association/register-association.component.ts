// register-association.component.ts
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { AssociationService } from 'src/app/services/association.service';
import { Association, AssociationStatus } from '../interfaces/association.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  @ViewChild('nameField') nameField: any;
  @ViewChild('emailField') emailField: any;
  @ViewChild('phoneField') phoneField: any;

  association: Association = {
    idAssociation: 0,
    associationName: '',
    associationAddress: '',
    associationPhone: '',
    associationEmail: '',
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

  ngAfterViewInit() {
    // Add a delay to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.associationForm) {
        this.associationForm.statusChanges?.subscribe(status => {
          // Form status changes subscription
        });
      }
    });
  }

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

  validateAssociationName(): boolean {
    if (!this.association.associationName) {
      return false;
    }
    const namePattern = /^[A-Za-z\s]{3,50}$/;
    return namePattern.test(this.association.associationName);
  }

  isFormValid(): boolean {
    if (!this.associationForm) return false;
    
    const basicFieldsValid = this.associationForm.form.valid;
    const filesValid = this.areFilesValid();
    const nameValid = this.validateAssociationName();
    
    return basicFieldsValid && filesValid && nameValid;
  }

  onSubmit() {
    this.submitted = true;

    if (!this.isFormValid()) {
      this.isSubmitting = false;
      return;
    }

    this.isSubmitting = true;
    this.submissionSuccess = false;
    this.submissionError = false;
    this.errorMessage = '';

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

    try {
      const formData = new FormData();
      
      // Log the values before appending to FormData
      console.log('Association Name:', this.association.associationName);
      console.log('Association Address:', this.association.associationAddress);
      console.log('Association Phone:', this.association.associationPhone);
      console.log('Association Email:', this.association.associationEmail);
      console.log('Description:', this.association.description);

      // Append all required fields with explicit string conversion
      formData.append('associationName', String(this.association.associationName).trim());
      formData.append('associationAddress', String(this.association.associationAddress).trim());
      formData.append('associationPhone', String(this.association.associationPhone).trim());
      formData.append('associationEmail', String(this.association.associationEmail).trim());
      formData.append('description', String(this.association.description).trim());
      formData.append('status', String(this.association.status));

      // Append files if they exist
      if (this.association.associationLogoPath) {
        formData.append('associationLogo', this.association.associationLogoPath);
      }
      if (this.association.registrationDocumentPath) {
        formData.append('registrationDocument', this.association.registrationDocumentPath);
      }
      if (this.association.legalDocumentPath) {
        formData.append('legalDocument', this.association.legalDocumentPath);
      }

      // Log the FormData contents
      console.log('Form Data Contents:');
      console.log('Association Name:', formData.get('associationName'));
      console.log('Association Address:', formData.get('associationAddress'));
      console.log('Association Phone:', formData.get('associationPhone'));
      console.log('Association Email:', formData.get('associationEmail'));
      console.log('Description:', formData.get('description'));
      console.log('Status:', formData.get('status'));
      console.log('Has Logo:', !!formData.get('associationLogo'));
      console.log('Has Registration Doc:', !!formData.get('registrationDocument'));
      console.log('Has Legal Doc:', !!formData.get('legalDocument'));

      // Create new headers with Authorization
      const token = this.authService.getToken();
      
      if (!token) {
        this.errorMessage = 'Authentication token is missing. Please log in again.';
        this.submissionError = true;
        this.isSubmitting = false;
        return;
      }

      // Create headers with only Authorization
      const newHeaders = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.httpClient.post('http://localhost:8089/api/associations', formData, { 
        headers: newHeaders,
        reportProgress: true,
        observe: 'response'
      })
        .subscribe({
          next: (response) => {
            console.log('Success Response:', response);
            this.submissionSuccess = true;
            this.router.navigate(['/association/account']);
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error Response:', error);
            this.submissionError = true;
            if (error.error?.message) {
              this.errorMessage = error.error.message;
            } else if (error.error?.error) {
              this.errorMessage = error.error.error;
            } else {
              this.errorMessage = 'There was an error while submitting the form. Please try again.';
            }
            this.isSubmitting = false;
          }
        });
    } catch (error) {
      console.error('Form submission error:', error);
      this.submissionError = true;
      this.errorMessage = 'An unexpected error occurred. Please try again.';
      this.isSubmitting = false;
    }
  }
}