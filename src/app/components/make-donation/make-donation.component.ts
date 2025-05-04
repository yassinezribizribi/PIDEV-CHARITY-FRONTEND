import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DonsService } from '../../services/dons.service';
import { DonationType } from '../../interfaces/donation.interface';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { AboutTwoComponent } from '../../components/about-two/about-two.component';
import { HomeBannerComponent } from "../../components/home-banner/home-banner.component";
import { AboutOneComponent } from '../../components/about-one/about-one.component';
import { AboutOneComponentCopy } from '../about-one copy/about-one.component';
@Component({
    selector: 'app-make-donation',
    standalone: true,
    imports: [FormsModule,
        AboutOneComponent,

        FooterComponent,
        HomeBannerComponent,
        NavbarComponent,
        AboutOneComponentCopy,
        CommonModule],
    templateUrl: './make-donation.component.html',
//     <div class="features-absolute">
//         <div class="p-4 rounded shadow position-relative bg-white">
//             <div class="section-title">
//                 <h4 class="title mb-3">Faire un don</h4>
//             </div>

//             <form class="mt-4" (ngSubmit)="onSubmit()" #donationForm="ngForm">
//                 <div *ngIf="errorMessage" class="alert alert-danger">
//                     {{ errorMessage }}
//                 </div>

//                 <div class="mb-3">
//                     <label class="form-label fw-semibold">Nom</label>
//                     <input [(ngModel)]="dons.nomDoneur" 
//                            name="nomDoneur" 
//                            type="text" 
//                            class="form-control" 
//                            placeholder="Votre nom" 
//                            required>
//                 </div>

//                 <div class="mb-3">
//                     <label class="form-label fw-semibold">Prénom</label>
//                     <input [(ngModel)]="dons.prenomDoneur" 
//                            name="prenomDoneur" 
//                            type="text" 
//                            class="form-control" 
//                            placeholder="Votre prénom" 
//                            required>
//                 </div>

//                 <div class="mb-3">
//                     <label class="form-label fw-semibold">Type de don</label>
//                     <select [(ngModel)]="dons.donationType" 
//                             class="form-select" 
//                             name="donationType" 
//                             required>
//                         <option value="FOOD">Nourriture</option>
//                         <option value="CLOTHES">Vêtements</option>
//                         <option value="MEDICAL">Matériel médical</option>
//                         <option value="OTHER">Autre</option>
//                     </select>
//                 </div>

//                 <div class="mb-3">
//                     <label class="form-label fw-semibold">Quantité</label>
//                     <div class="input-group">
//                         <button type="button" 
//                                 class="btn btn-outline-secondary" 
//                                 (click)="decrementQuantity()">-</button>
//                         <input [(ngModel)]="dons.quantite" 
//                                name="quantite" 
//                                type="number" 
//                                class="form-control text-center" 
//                                min="1"
//                                required>
//                         <button type="button" 
//                                 class="btn btn-outline-secondary" 
//                                 (click)="incrementQuantity()">+</button>
//                     </div>
//                 </div>

//                 <button type="submit" 
//                         class="btn btn-primary w-100" 
//                         [disabled]="!donationForm.form.valid || submitted">
//                     {{ submitted ? 'En cours...' : 'Faire un don' }}
//                 </button>
//             </form>
//         </div>
//     </div>
//     `
})
export class MakeDonationComponent implements OnInit {
    dons = {
        nomDoneur: '',
        prenomDoneur: '',
        quantite: 1,
        donationType: DonationType.FOOD
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

        if (!localStorage.getItem('auth_token')) {
            this.errorMessage = 'Veuillez vous connecter pour faire un don';
            this.submitted = false;
            setTimeout(() => {
                this.router.navigate(['/login']);
            }, 2000);
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
            quantite: 1,
            donationType: DonationType.FOOD
        };
        this.submitted = false;
    }
}
