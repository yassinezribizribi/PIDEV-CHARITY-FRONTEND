import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DonsService } from '../../services/dons.service';
import { Dons } from '../../models/dons.model';
import { DeliveryMethod } from '../../interfaces/dons.interface';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-update-dons-nonauth',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, NavbarComponent],
  templateUrl: './update-dons-nonauth.component.html',
  styleUrls: ['./update-dons-nonauth.component.scss']
})
export class UpdateDonsNonauthComponent implements OnInit {
  donationId: number | null = null;
  token: string | null = null;
  dons: Dons | null = null;
  loading: boolean = true;
  saving: boolean = false;
  error: string | null = null;
  success: boolean = false;
  
  deliveryMethods = Object.values(DeliveryMethod);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private donsService: DonsService
  ) {}

  ngOnInit(): void {
    // Get the donation ID from the URL parameter
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.donationId = Number(idParam);
    }
    
    // Get the token from the query parameter
    this.token = this.route.snapshot.queryParamMap.get('token');
    
    console.log('Donation ID from URL:', this.donationId);
    console.log('Token from URL:', this.token);
    
    // Validate the donation ID
    if (!this.donationId || isNaN(this.donationId)) {
      this.error = 'Invalid donation ID. Please check the link in your email.';
      this.loading = false;
      return;
    }
    
    // Validate the token
    if (!this.token) {
      this.error = 'Missing token. Please check the link in your email.';
      this.loading = false;
      return;
    }
    
    // Check if the token is in the correct format (hash-expirationTime)
    if (!this.token.includes('-')) {
      this.error = 'Invalid token format. Please check the link in your email.';
      this.loading = false;
      return;
    }
    
    // Check if the token is expired
    if (this.isTokenExpired(this.token)) {
      this.error = 'This link has expired. Please request a new link.';
      this.loading = false;
      return;
    }
    
    // If we get here, both the donation ID and token are valid
    this.loadDons();
  }

  // Check if the token is expired
  isTokenExpired(token: string): boolean {
    const tokenParts = token.split('-');
    if (tokenParts.length !== 2) {
      return true; // Invalid token format, consider it expired
    }
    
    const expirationTime = Number(tokenParts[1]);
    return Date.now() > expirationTime;
  }

  loadDons(): void {
    this.loading = true;
    // Since we don't have a method to get a donation by ID without auth,
    // we'll need to create a temporary Dons object with the ID
    this.dons = {
      idDons: this.donationId!,
      nomDoneur: '',
      prenomDoneur: '',
      donorEmail: '',
      quantite: 0,
      deliveryMethod: DeliveryMethod.DROP_OFF,
      donorAddress: '',
      scheduledDateTime: new Date(),
      donorNote: '',
      associationValidated: false,
      idDonation: this.donationId!
    };
    this.loading = false;
  }

  updateDons(): void {
    if (!this.dons || !this.donationId || !this.token) return;
    
    // Validate that address is provided if delivery method is PICK_UP
    if (this.dons.deliveryMethod === DeliveryMethod.PICK_UP && 
        (!this.dons.donorAddress || this.dons.donorAddress.trim() === '')) {
      this.error = 'Address is required for PICK_UP delivery method.';
      return;
    }
    
    this.saving = true;
    console.log('Updating donation with ID from URL:', this.donationId);
    console.log('Using token:', this.token);
    
    // Create a simplified Dons object with only the fields that can be updated
    const updatedDons: Partial<Dons> = {
      quantite: this.dons.quantite,
      scheduledDateTime: this.dons.scheduledDateTime,
      deliveryMethod: this.dons.deliveryMethod,
      donorAddress: this.dons.deliveryMethod === DeliveryMethod.PICK_UP ? this.dons.donorAddress || '' : undefined,
      donorNote: this.dons.deliveryMethod === DeliveryMethod.PICK_UP ? this.dons.donorNote || '' : undefined
    };
    
    this.donsService.updateDonsNonAuth(this.donationId, this.token, updatedDons).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        this.success = true;
        this.saving = false;
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error details:', err);
        if (err.status === 403) {
          this.error = 'The link has expired or is invalid. Please request a new link.';
        } else if (err.status === 400) {
          if (err.error && err.error.includes('Address is required')) {
            this.error = 'Address is required for PICK_UP delivery method.';
          } else {
            this.error = 'Donation not found. Please check the link in your email.';
          }
        } else {
          this.error = 'Error updating donation. Please try again later.';
        }
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
