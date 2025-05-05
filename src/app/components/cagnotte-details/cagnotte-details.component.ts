import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssociationDonationService } from '../../services/association-donation.service';
import { CagnotteEnligne, DonationSuggestionDTO } from '../../interfaces/donation.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PaymentService } from 'src/app/services/payment.service';
import { AuthService } from '../../services/auth.service';

import { AboutOneComponentCopy } from '../about-one copy/about-one.component';
import { AboutOneComponent } from '../../components/about-one/about-one.component';
import { HomeBannerComponent } from '../../components/home-banner/home-banner.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-cagnotte-details',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    AboutOneComponent,
    FooterComponent,
    HomeBannerComponent,
    NavbarComponent,
    AboutOneComponentCopy
  ],
  templateUrl: './cagnotte-details.component.html',
  styleUrl: './cagnotte-details.component.scss'
})
export class CagnotteDetailsComponent implements OnInit {
  cagnotte: CagnotteEnligne | null = null;
  loading = true;
  error: string | null = null;
  amountToDonate!: number;
  suggestions: DonationSuggestionDTO | null = null;
  suggestedAmount: number | null = null;
  spinSuggestion: number | null = null;

  private stripe: Stripe | null = null;
  cardElement: any;
  cardMounted = false;

  showModal = false;
  spinning = false;
  spinDegrees = 0;
  selectedAmount: number | null = null;

  spinOptions: number[] = [];

  isAuthenticated = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private donationService: AssociationDonationService,
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const donationId = this.route.snapshot.paramMap.get('id');
    if (donationId) {
      this.loadCagnotteDetails(+donationId);
    } else {
      this.error = 'No donation ID provided';
      this.loading = false;
    }

    this.stripe = await loadStripe('pk_test_51RBvCVPSRSCwAwrj3Rqio6fZHEBhgbInaDD2B9IOsEheYIIMUAeeDNxBAEdvDLQ4gq4Vtqc9zu0U0PoTacMzTPm500R4wERz38');
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  // ----------- UI Methods -----------
  openSpinModal() {
    this.showModal = true;
    this.spinDegrees = 0;
    this.selectedAmount = null;
  }

  closeModal() {
    this.showModal = false;
    this.spinning = false;
  }

  spin() {
    this.spinning = true;
    const randomIndex = Math.floor(Math.random() * this.spinOptions.length);
    this.selectedAmount = this.spinOptions[randomIndex];

    const fullRotations = 5 * 360;
    const finalRotation = fullRotations + (360 / this.spinOptions.length) * randomIndex;
    this.spinDegrees = finalRotation;

    setTimeout(() => {
      this.spinning = false;
    }, 3000);
  }

  useSuggestedAmount() {
    if (this.selectedAmount) {
      this.amountToDonate = this.selectedAmount;
      this.onAmountChange(this.amountToDonate);
      this.closeModal();
    }
  }

  useInitialSuggestion() {
    if (this.suggestions?.suggestion) {
      this.amountToDonate = this.suggestions.suggestion;
      this.onAmountChange(this.amountToDonate);
    }
  }
  

  calculateProgress(): number {
    if (!this.cagnotte) return 0;
    return (this.cagnotte.currentAmount / this.cagnotte.goalAmount) * 100;
  }

  // ----------- Backend Integration -----------
  loadCagnotteDetails(donationId: number): void {
    this.donationService.getCagnotteByDonationId(donationId).subscribe({
      next: (data) => {
        this.cagnotte = data;
        this.loading = false;
        setTimeout(() => this.mountCardElement(), 100);

        // Load initial suggestions without any input
        if (data.idCagnotte) {
          this.paymentService.getDonationSuggestions(data.idCagnotte).subscribe({
            next: (suggestions) => {
              if (suggestions) {
                this.suggestions = suggestions;
                if (suggestions.suggestion) {
                  this.suggestedAmount = suggestions.suggestion;
                }
              }
            },
            error: (err) => {
              console.error('Failed to load initial suggestions', err);
              // Set default suggestion if loading fails
              this.suggestions = {
                average: null,
                todayAverage: null,
                suggestion: 50,
                message: "Consider making a donation to support this cause"
              };
            }
          });

          // Load spin options
          this.paymentService.getWheelSuggestions(data.idCagnotte).subscribe({
            next: (options) => {
              this.spinOptions = options;
            },
            error: (err) => {
              console.error('Failed to load spin options', err);
              this.spinOptions = [50, 100, 150, 200]; // fallback
            }
          });
        }
      },
      error: (err) => {
        this.error = 'Failed to load cagnotte details';
        this.loading = false;
        console.error('Error loading cagnotte:', err);
      }
    });
  }

  onAmountChange(newAmount: number) {
    if (newAmount && this.cagnotte?.idCagnotte) {
      const cagnotteId = this.cagnotte.idCagnotte;
  
      // Load donation suggestions with proper error handling
      this.paymentService.getDonationSuggestions(cagnotteId, newAmount).subscribe({
        next: (data) => {
          if (data) {
            this.suggestions = data;
            // If we have a suggestion, update the amount
            if (data.suggestion) {
              this.suggestedAmount = data.suggestion;
            }
          } else {
            // If no suggestion is returned, it means the user's input is generous
            this.suggestions = {
              average: null,
              todayAverage: null,
              suggestion: undefined,
              message: "Your donation is very generous! Thank you for your support."
            };
            this.suggestedAmount = null;
          }
        },
        error: (err) => {
          console.error('Failed to load suggestions', err);
          this.suggestions = null;
          this.suggestedAmount = null;
        }
      });
  
      // Load wheel suggestions with proper error handling
      this.paymentService.getWheelSuggestions(cagnotteId, newAmount).subscribe({
        next: (options) => {
          if (options && options.length > 0) {
            this.spinOptions = options;
          } else {
            this.spinOptions = [50, 100, 150, 200]; // fallback
          }
        },
        error: (err) => {
          console.error('Failed to load spin options', err);
          this.spinOptions = [50, 100, 150, 200]; // fallback
        }
      });
    }
  }
  
  spinWheel() {
    if (!this.cagnotte || !this.amountToDonate) return;
    const cagnotteId = this.cagnotte.idCagnotte;
    if (!cagnotteId) return;

    this.paymentService.getWheelSuggestions(cagnotteId, this.amountToDonate).subscribe({
      next: (result) => {
        if (result && result.length > 0) {
          this.spinSuggestion = result[0]; // Take first suggestion from array
          console.log('🎯 Suggested amount from wheel:', this.spinSuggestion);
        } else {
          this.spinSuggestion = null;
        }
      },
      error: (err) => {
        console.error('Spin suggestion error:', err);
        this.spinSuggestion = null;
      }
    });
  }

  async mountCardElement() {
    if (!this.stripe || this.cardMounted) return;

    const elements = this.stripe.elements();
    const style = {
      base: {
        color: '#333',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        fontWeight: '500',
        backgroundColor: '#fff3e0',
        '::placeholder': {
          color: '#ff9800',
          fontStyle: 'italic'
        }
      },
      invalid: {
        color: '#e53935',
        iconColor: '#e53935'
      }
    };

    this.cardElement = elements.create('card', {
      style,
      hidePostalCode: true,
      classes: {
        base: 'stripe-element',
        focus: 'stripe-element-focus',
        invalid: 'stripe-element-invalid'
      }
    });

    this.cardElement.mount('#card-element');
    this.cardMounted = true;
  }

  async pay() {
    if (!this.stripe || !this.amountToDonate || !this.cagnotte) return;
  
    const amountInCents = this.amountToDonate;
    const cagnotteId = this.cagnotte.idCagnotte;
  
    if (typeof cagnotteId === 'undefined') {
      alert('Cagnotte ID is missing!');
      return;
    }
  
    this.paymentService.createPaymentIntent(amountInCents, cagnotteId).subscribe(async (res) => {
      const clientSecret = res.clientSecret;
  
      const result = await this.stripe!.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement
        }
      });
  
      if (result.error) {
        alert('Payment failed: ' + result.error.message);
      } else if (result.paymentIntent?.status === 'succeeded') {
        alert('✅ Payment succeeded! Refreshing...');
        
        // Reload the current route to refresh the component
        this.router.navigateByUrl('/index', { skipLocationChange: true }).then(() => {
          this.router.navigate([this.router.url]);
        });
      }
    });
  }
  

  // ----------- Input Formatters -----------
  onCardNumberChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    input.value = value.replace(/(\d{4})/g, '$1 ').trim();
  }

  onExpDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 4);
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    input.value = value;
  }

  onCVCChange(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 4);
  }

  onZipChange(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
  }
}
