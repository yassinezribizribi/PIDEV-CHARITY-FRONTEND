import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CountUpModule } from 'ngx-countup';
import { AssociationDonationService } from '../../services/association-donation.service';
import { Donation } from '../../interfaces/donation.interface';

@Component({
    selector: 'app-about-one-copy',
    imports: [
        CommonModule,
        //RouterLink,
        CountUpModule
    ],
    templateUrl: './about-one.component.html',
    styleUrls: ['./about-one.component.scss']
})
export class AboutOneComponentCopy implements OnInit {
    donation: Donation | null = null;
    idDonation!: number;

    constructor(
        private route: ActivatedRoute,
        private donationService: AssociationDonationService
    ) {}

    ngOnInit(): void {
        // Ensure that you get the 'id' from the route and check for null or undefined
        this.idDonation = Number(this.route.snapshot.paramMap.get('idDonation'));
        if (!isNaN(this.idDonation)) {
            this.getDonationDetails();
        } else {
            console.error('Invalid donation ID');
        }
        this.route.paramMap.subscribe(params => {
            const id = params.get('idDonation');
            console.log('Donation ID from URL:', id); // Check the ID value
            if (id) {
                this.idDonation = +id; // Convert to number
            }
        });
        
    }

    getDonationDetails(): void {
        // Ensure that you call the service method to get the donation details by ID
        this.donationService.getDonationById(this.idDonation).subscribe(
            (data) => {
                this.donation = data;  // Store the fetched donation details
            },
            (error) => {
                console.error('Error fetching donation details:', error);  // Log errors for debugging
            }
        );
    }
}
