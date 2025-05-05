import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DonsService } from '../../services/dons.service';
import { DeliveryMethod } from '../../interfaces/dons.interface'; // Assuming your DeliveryMethod enum is in this file
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { AboutTwoComponent } from '../../components/about-two/about-two.component';
import { HomeBannerComponent } from "../../components/home-banner/home-banner.component";
import { AboutOneComponent } from '../../components/about-one/about-one.component';
import { AboutOneComponentCopy } from '../about-one copy/about-one.component';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string;         // usually user ID or email
    firstName?: string;  // assuming your backend sends it
    lastName?: string;
    email?: string;
    // add any other fields you have
}

@Component({
    selector: 'app-make-donation',
    standalone: true,
    imports: [FormsModule, AboutOneComponent, FooterComponent, HomeBannerComponent, NavbarComponent, AboutOneComponentCopy, CommonModule],
    templateUrl: './make-donation.component.html',
})

export class MakeDonationComponent implements OnInit {
    dons = {
        nomDoneur: '',
        prenomDoneur: '',
        donorEmail: '',

        quantite: 1,
        scheduledDateTime: new Date(),
        associationValidated: true,
        donorNote: '',
        deliveryMethod: DeliveryMethod.DROP_OFF, // Or 'PICK_UP' based on your form input
        donorAddress: '',
        idDonation: 0 // Added idDonation if needed directly here
    };

    submitted = false;
    errorMessage = '';
    idDonation!: number; // Store the donation ID from the URL

    constructor(
        private donsService: DonsService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        // Retrieve the donation ID from the route parameters
        this.route.paramMap.subscribe(params => {
            const id = params.get('idDonation');
            if (id) {
                this.idDonation = +id; // Convert string to number
            }
        });

        // 👉 Auto-fill donor information if JWT is present
        const token = localStorage.getItem('jwt');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                if (decoded.firstName) this.dons.nomDoneur = decoded.firstName;
                if (decoded.lastName) this.dons.prenomDoneur = decoded.lastName;
                if (decoded.email) this.dons.donorEmail = decoded.email;
            } catch (error) {
                console.error('Erreur lors du décodage du token:', error);
            }
        }
    }

    incrementQuantity() {
        this.dons.quantite++;
    }

    decrementQuantity() {
        if (this.dons.quantite > 1) {
            this.dons.quantite--;
        }
    }

    onSubmit() {
        this.submitted = true;
        this.errorMessage = '';

        if (!this.validateForm()) {
            this.submitted = false;
            return;
        }


        // Pass the idDonation from the URL to the service
        this.donsService.contributeToDonation(this.idDonation, this.dons).subscribe({
            next: (response) => {
                console.log('Donation créée avec succès', response);
                alert('Merci pour votre donation!');
                this.resetForm();
            },
            error: (error) => {
                console.error('Erreur:', error);
                this.errorMessage = 'Une erreur est survenue.';
                this.submitted = false;
            }
        });
    }

    private validateForm(): boolean {
        if (!this.dons.nomDoneur || !this.dons.prenomDoneur || !this.dons.quantite) {
            this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
            return false;
        }
        return true;
    }

    private resetForm() {
        this.dons = {
            nomDoneur: '',
            prenomDoneur: '',
            donorEmail:'',

            quantite: 1,
            scheduledDateTime: new Date(),
            associationValidated: true,
            donorNote: '',
            deliveryMethod: DeliveryMethod.DROP_OFF, // Reset delivery method as DROP_OFF
            donorAddress: '',
            idDonation: 0
        };
        this.submitted = false;
    }
}
