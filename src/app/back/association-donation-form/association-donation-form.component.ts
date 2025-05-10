import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DonationType, CagnotteEnligne, DonationStatus } from '../../interfaces/donation.interface';
import { AssociationDonationService } from '../../services/association-donation.service';
import { AdminNavbarComponent } from '../admin/admin-navbar/admin-navbar.component';
import { ValidationErrorService } from '../../services/validation-error.service';
import { ToastNotificationService } from '../../services/toast-notification.service';
import { FormUtilsService } from '../../services/form-utils.service';


@Component({
  selector: 'app-association-donation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  templateUrl: './association-donation-form.component.html',
  styleUrls: ['./association-donation-form.component.scss']
})
export class AssociationDonationFormComponent implements OnInit {
  @ViewChild('donationForm') donationForm!: NgForm;

  donation = {
    titre: '',
    description: '',
    quantiteDemandee: 1,
    quantiteDonnee: 0,
    quantiteExcedentaire: 0,
    imageUrl: '',
    startDate: new Date().toISOString(),
    endDate: new Date(),
    donationType: DonationType.FOOD,
    cagnotteenligne: null as CagnotteEnligne | null,
    status: DonationStatus.ACTIVE,
    priority: 1
  };

  enableCagnotte: boolean = false;
  submitted = false;
  errorMessage = '';

  // Priority options
  priorityOptions = [
    { value: 1, label: 'Low' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'High' },
    { value: 4, label: 'Urgent' }
  ];
  constructor(
    private donationService: AssociationDonationService,
    private router: Router,
    public validationErrorService: ValidationErrorService,
    private formUtils: FormUtilsService,
    private toast: ToastNotificationService
  ) {}
  

  ngOnInit(): void {
    if (this.enableCagnotte && !this.donation.cagnotteenligne) {
      this.donation.cagnotteenligne = {
        title: '',
        description: '',
        goalAmount: 0,
        currentAmount: 0
      };
    }
  }

  incrementQuantity() {
    this.donation.quantiteDemandee++;
  }

  decrementQuantity() {
    if (this.donation.quantiteDemandee > 1) {
      this.donation.quantiteDemandee--;
    }
  }

  onEnableCagnotteChange() {
    if (this.enableCagnotte) {
      this.donation.cagnotteenligne = {
        title: '',
        description: '',
        goalAmount: 0,
        currentAmount: 0
      };
    } else {
      this.donation.cagnotteenligne = null;
    }
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
  
    // 🔥 Step 1: Mark all fields as touched using centralized utility
    this.formUtils.markAllFieldsAsTouched(this.donationForm.form);
  
    // 🔍 Step 2: Client-side form check
    if (!this.donationForm.form.valid) {
      this.toast.showError('Please fix the errors before submitting.');
      this.formUtils.scrollToFirstInvalidField(this.donationForm.form);
      return;
    }
  
    // 🧼 Step 3: Normalize donation object
    if (!this.enableCagnotte) {
      this.donation.cagnotteenligne = null;
    }
  
    // 🚀 Step 4: Submit to backend
    this.donationService.createDonation(this.donation).subscribe({
      next: () => {
        this.toast.showSuccess('Donation created successfully!');
        this.router.navigate(['/association/account']);
      },
      error: (error) => {
        this.toast.showError('An error occurred while creating the donation.');
  
        // 🛠️ Step 5: Apply server-side errors if available
        if (Array.isArray(error.error?.errors)) {
          this.validationErrorService.applyServerValidationErrors(error.error.errors, this.donationForm.form);
  
          // 💥 Optional: scroll to first field with server error
          const firstInvalidField = Object.keys(this.donationForm.controls).find(key =>
            this.donationForm.controls[key].invalid
          );
  
          if (firstInvalidField) {
            const element = document.querySelector(`[name="${firstInvalidField}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              (element as HTMLElement).focus();
            }
          }
  
          this.submitted = false;
        }
      }
    });
  }
  markAllFieldsAsTouched(form: NgForm) {
    Object.keys(form.controls).forEach(field => {
      const control = form.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
  }
  
  

  get cagnotte() {
    return this.donation.cagnotteenligne || {
      title: '',
      description: '',
      goalAmount: 0,
      currentAmount: 0
    };
  }

  onCancel() {
    this.router.navigate(['/association/account']);
  }
}