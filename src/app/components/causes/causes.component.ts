import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';
import { Donation , DonationType } from '../../interfaces/donation.interface'; // Import the donation interface
import { AssociationDonationService } from 'src/app/services/association-donation.service'; 
import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'app-causes',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './causes.component.html',
    styleUrl: './causes.component.scss'
})
export class CausesComponent implements OnInit {
  donationsData: Donation[] = [];  // Array to hold donation data
  errorMessage: string = ''; // Variable to store error message

  constructor(private donationService: AssociationDonationService) {}

  ngOnInit(): void {
    // Fetch donations from the service on component initialization
    this.donationService.getDonations().subscribe(
      (data: Donation[]) => {
        this.donationsData = data;  // Assign the data to donationsData
      },
      (error) => {
        this.errorMessage = 'Error fetching donations. Please try again later.'; // Set error message
        console.error('Error fetching donations:', error); // Log error for debugging
      }
    );
  }
  // Scroll to the "Make Donation" section
  scrollToMakeDonationSection(donation: any) {
    // Scroll smoothly to the Make Donation section
    const donationSection = document.getElementById('make-donation-section');
    if (donationSection) {
      window.scrollTo({
        top: donationSection.offsetTop - 100, // Adjust for header offset
        behavior: 'smooth'
      });
    }

    // Optionally, pass donation data to the next section (could be stored or routed)
    // For example, set it in a service, or navigate with query params if needed
    console.log('Donation selected: ', donation); // This is where you can use the donation data
  }


  
}