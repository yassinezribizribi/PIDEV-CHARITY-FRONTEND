import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Donation, DonationType, CagnotteEnligne } from '../../interfaces/donation.interface';
import { AssociationDonationService } from 'src/app/services/association-donation.service'; 
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-causes',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink
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