import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Donation, DonationType, CagnotteEnligne } from '../../interfaces/donation.interface';
import { AssociationDonationService } from 'src/app/services/association-donation.service'; 
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-causes',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,    FormsModule

    ],
    templateUrl: './causes.component.html',
    styleUrl: './causes.component.scss'
})
export class CausesComponent implements OnInit {
  donationsData: Donation[] = [];
  errorMessage: string = '';

  constructor(
    private donationService: AssociationDonationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDonations();
  }

  loadDonations(): void {
    this.donationService.getDonations().subscribe({
      next: (data: Donation[]) => {
        this.donationsData = data;
      },
      error: (error) => {
        this.errorMessage = 'Error fetching donations. Please try again later.';
        console.error('Error fetching donations:', error);
      }
    });
  }
// Angular helper function:
getDaysLeft(donation: Donation): number {
  const today = new Date();
  const end = new Date(donation.endDate);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
}
selectedType: string = '';

get filteredDonations() {
  if (!this.selectedType) return this.donationsData;
  return this.donationsData.filter(d => d.donationType === this.selectedType);
}
getDonationUrgencyClass(donation: any): string {
  if (donation.urgent) return 'urgent-border'; // Always red if urgent

  const days = this.getDaysLeft(donation);

  if (days <= 3) return 'warning-border'; // Orange
  if (days <= 7) return 'caution-border'; // Yellow
  return 'safe-border'; // Green
}


  getDonationProgress(donation: Donation): number {
    if (!donation.quantiteDemandee || donation.quantiteDemandee === 0) return 0;
    return (donation.quantiteDonnee / donation.quantiteDemandee) * 100;
  }

  getCagnotteProgress(cagnotte: CagnotteEnligne): number {
    if (!cagnotte?.goalAmount || cagnotte.goalAmount === 0) return 0;
    return (cagnotte.currentAmount / cagnotte.goalAmount) * 100;
  }

  getDonationTypeClass(type: DonationType): string {
    switch(type) {
      case DonationType.FOOD: return 'success';
      case DonationType.CLOTHES: return 'info';
      case DonationType.MEDICAL: return 'danger';
      default: return 'secondary';
    }
  }

  getDonationTypeLabel(type: DonationType): string {
    switch(type) {
      case DonationType.FOOD: return 'Food';
      case DonationType.CLOTHES: return 'Clothes';
      case DonationType.MEDICAL: return 'Medical';
      default: return type;
    }
  }

  scrollToMakeDonationSection(donation: Donation): void {
    const donationSection = document.getElementById('make-donation-section');
    if (donationSection) {
      window.scrollTo({
        top: donationSection.offsetTop - 100,
        behavior: 'smooth'
      });
    }
    console.log('Donation selected: ', donation);
  }

  navigateToCagnotteDetails(donationId: number): void {
    this.router.navigate(['/cagnotte', donationId]);
  }
}