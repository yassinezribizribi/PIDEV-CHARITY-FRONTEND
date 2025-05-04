import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssociationDonationService } from '../../services/association-donation.service';
import { CagnotteEnligne } from '../../interfaces/donation.interface';
import { CommonModule } from '@angular/common';
import { AboutOneComponentCopy } from '../about-one copy/about-one.component';
import { AboutOneComponent } from '../../components/about-one/about-one.component';
import { HomeBannerComponent } from "../../components/home-banner/home-banner.component";
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PaymentService } from 'src/app/services/Payment.service';
@Component({
  selector: 'app-cagnotte-details',
  standalone: true,
  imports: [FormsModule, AboutOneComponent, FooterComponent, HomeBannerComponent, NavbarComponent, AboutOneComponentCopy, CommonModule],
  templateUrl: './cagnotte-details.component.html',
  styleUrl: './cagnotte-details.component.scss'
})
export class CagnotteDetailsComponent implements OnInit {
  cagnotte: CagnotteEnligne | null = null;
  loading = true;
  error: string | null = null;
  amountToDonate: number = 0;

  private stripe: Stripe | null = null;
  cardElement: any;
  cardMounted = false;

  constructor(
    private route: ActivatedRoute,
    private donationService: AssociationDonationService,
    private paymentService: PaymentService
  ) {}

  async ngOnInit(): Promise<void> {
    const donationId = this.route.snapshot.paramMap.get('id');
    if (donationId) {
      this.loadCagnotteDetails(+donationId);
    } else {
      this.error = 'No donation ID provided';
      this.loading = false;
    }

    this.stripe = await loadStripe('pk_test_51RBvCVPSRSCwAwrj3Rqio6fZHEBhgbInaDD2B9IOsEheYIIMUAeeDNxBAEdvDLQ4gq4Vtqc9zu0U0PoTacMzTPm500R4wERz38'); // 👉 your Stripe PUBLIC KEY
  }

  loadCagnotteDetails(donationId: number): void {
    this.donationService.getCagnotteByDonationId(donationId).subscribe({
      next: (data) => {
        this.cagnotte = data;
        this.loading = false;
        setTimeout(() => this.mountCardElement(), 100); // Delay to ensure DOM is ready
      },
      error: (err) => {
        this.error = 'Failed to load cagnotte details';
        this.loading = false;
        console.error('Error loading cagnotte:', err);
      }
    });
  }

  calculateProgress(): number {
    if (!this.cagnotte) return 0;
    return (this.cagnotte.currentAmount / this.cagnotte.goalAmount) * 100;
  }

  async mountCardElement() {
    if (!this.stripe || this.cardMounted) return;
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card');
    this.cardElement.mount('#card-element');
    this.cardMounted = true;
  }

  async pay() {
    if (!this.stripe || !this.amountToDonate || !this.cagnotte) return;
  
    const amountInCents = this.amountToDonate ;
    const cagnotteId = this.cagnotte.idCagnotte;
  
    // Ensure cagnotteId is a valid number
    if (typeof cagnotteId === 'undefined') {
      alert('Cagnotte ID is missing!');
      return;
    }
  
    // Call the backend to create the payment intent, passing the cagnotteId
    this.paymentService.createPaymentIntent(amountInCents, cagnotteId).subscribe(async (res) => {
      const clientSecret = res.clientSecret;
  
      const result = await this.stripe!.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
        }
      });
  
      if (result.error) {
        alert('Payment failed: ' + result.error.message);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        alert('Payment successful!');
        // Optionally refresh the page or call a method to update the currentAmount
      }
    });
  }
}  