import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DonationType, CagnotteEnligne } from '../../interfaces/donation.interface';
import { AssociationDonationService } from '../../services/association-donation.service';
import { AdminNavbarComponent } from '../admin/admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-association-donation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  templateUrl: './association-donation-form.component.html',
  styleUrls: ['./association-donation-form.component.scss']
})
export class AssociationDonationFormComponent {
  donation = {
    titre: '',
    description: '',
    quantiteDemandee: 1,
    quantiteDonnee: 0,
    availability: false,
    lastUpdated: new Date(),
    donationType: DonationType.FOOD,
    nomDoneur: '',
    prenomDoneur: '',
    numCompte: 0,
    quantite: 0,
    subscribers: [],
    cagnotteenligne: null as CagnotteEnligne | null,
    doneur: 1
  };
  
  enableCagnotte: boolean = false;

  submitted = false;
  errorMessage = '';

  constructor(
    private donationService: AssociationDonationService,
    private router: Router
  ) {}

  incrementQuantity() {
    this.donation.quantiteDemandee++;
  }

  decrementQuantity() {
    if (this.donation.quantiteDemandee > 1) {
      this.donation.quantiteDemandee--;
    }
  }

  ngOnInit(): void {
    // Optional: initialize cagnotteenligne when the component loads
    if (this.enableCagnotte && !this.donation.cagnotteenligne) {
      this.donation.cagnotteenligne = { title: '', description: '', goalAmount: 0, currentAmount: 0 };
    }
  } 


  onEnableCagnotteChange() {
    if (this.enableCagnotte) {
      // Initialize cagnotteenligne when checkbox is checked
      this.donation.cagnotteenligne = this.donation.cagnotteenligne || { title: '', description: '', goalAmount: 0, currentAmount: 0 };
    } else {
      // Reset cagnotteenligne to null when checkbox is unchecked
      this.donation.cagnotteenligne = null;
    }
  }


  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
  
    if (!this.enableCagnotte) {
      this.donation.cagnotteenligne = null; // Now this works!
    }
  
    console.log('Données de donation à envoyer:', this.donation);
  
    this.donationService.createDonation(this.donation).subscribe({
      next: () => {
        alert('Donation créée avec succès!');
        this.router.navigate(['/association/account']);
      },
      error: (error) => {
        console.error('Erreur lors de la création de la donation:', error);
        this.errorMessage = 'Une erreur est survenue lors de la création de la donation.';
        this.submitted = false;
      }
    });
  }
  
  
  
  get cagnotte() {
    return this.donation.cagnotteenligne || { title: '', description: '', goalAmount: 0, currentAmount: 0 };
  }
  

  onCancel() {
    this.router.navigate(['/association/account']);
  }
} 