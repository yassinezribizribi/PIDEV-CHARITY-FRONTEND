import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssociationDonationService } from '../../services/association-donation.service';
import { Donation, DonationType } from '../../interfaces/donation.interface';
import { CommonModule } from '@angular/common';

@Component({
  imports: [FormsModule, ReactiveFormsModule, CommonModule], // ✅ Add ReactiveFormsModule
  standalone: true,
  selector: 'app-edit-donation',
  templateUrl: './edit-donation.component.html',
  styleUrls: ['./edit-donation.component.scss']
})
export class EditDonationComponent implements OnInit {
  donationForm: FormGroup;
  donationId: number;
  donation: Donation | null = null;
  loading = true;
  error: string | null = null;
  donationTypeOptions = Object.values(DonationType); // Add donation type options

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private donationService: AssociationDonationService
  ) {
    this.donationForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      quantiteDemandee: ['', [Validators.required, Validators.min(1)]],
      quantiteDonnee: ['', [Validators.required, Validators.min(0)]],
      availability: [false, Validators.required],
      lastUpdated: ['', Validators.required],
      donationType: ['', Validators.required],
      // Cagnotte en ligne fields
      enableCagnotte: [false],
      cagnotteTitle: [''],
      cagnotteDescription: [''],
      goalAmount: ['', [Validators.min(0)]],
      currentAmount: ['', [Validators.min(0)]]
    });

    this.donationId = +this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadDonation();
  }

  // Fetch donation details
  loadDonation() {
    this.donationService.getDonationById(this.donationId).subscribe({
      next: (donation) => {
        this.donation = donation;
        this.donationForm.patchValue({
          titre: donation.titre,
          description: donation.description,
          quantiteDemandee: donation.quantiteDemandee,
          quantiteDonnee: donation.quantiteDonnee,
          lastUpdated: this.formatDate(new Date(donation.lastUpdated)),
          donationType: donation.donationType,
          // Cagnotte en ligne fields
          enableCagnotte: !!donation.cagnotteenligne,
          cagnotteTitle: donation.cagnotteenligne?.title || '',
          cagnotteDescription: donation.cagnotteenligne?.description || '',
          goalAmount: donation.cagnotteenligne?.goalAmount || 0,
          currentAmount: donation.cagnotteenligne?.currentAmount || 0
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load donation details';
        this.loading = false;
      }
    });
  }

  // Format date for input field
  formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  // Handle form submission
  onSubmit() {
    if (this.donationForm.invalid) {
      return;
    }

    const formValue = this.donationForm.value;
    const updatedDonation: Donation = {
      ...this.donation,
      ...formValue,
      lastUpdated: new Date(formValue.lastUpdated),
      cagnotteenligne: formValue.enableCagnotte ? {
        idCagnotte: this.donation?.cagnotteenligne?.idCagnotte,
        title: formValue.cagnotteTitle,
        description: formValue.cagnotteDescription,
        goalAmount: formValue.goalAmount,
        currentAmount: formValue.currentAmount
      } : null
    };

    this.donationService.updateDonation(this.donationId, updatedDonation).subscribe({
      next: () => {
        this.router.navigate(['/association/account']);
      },
      error: () => {
        this.error = 'Failed to update donation';
      }
    });
  }

  // Cancel editing and go back
  onCancel() {
    this.router.navigate(['/association/account']);
  }
}