import { Component, OnInit, ViewChild, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssociationService } from '../../services/association.service';
import { Association } from '../../interfaces/association.interface';
import { register } from 'swiper/element/bundle';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

register();

@Component({
  selector: 'app-top-associations-slider',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section class="section">
      <div class="video-background">
        <video autoplay loop muted playsinline class="background-video">
          <source src="assets/images/video.mp4" type="video/mp4">
        </video>
        <div class="overlay"></div>
      </div>

      <div class="container relative z-10">
        <div class="row justify-content-center">
          <div class="col-12">
            <div class="section-title text-center">
              <h4 class="title">Top Performing Associations</h4>
              <p class="text-white-50 para-desc mx-auto">
                Meet our highest-rated associations making significant impacts in their communities
              </p>
            </div>
          </div>
        </div>

        <div class="row justify-content-center">
          <div class="col-12">
            <swiper-container #swiperRef init="false">
              <swiper-slide *ngFor="let association of topAssociations" class="swiper-slide">
                <div class="testimonial-card">
                  <div class="card-header">
                    <div class="tier-badge" [ngClass]="getTierClass(association.partnershipTier || 'Bronze')">
                      <mat-icon>{{getTierIcon(association.partnershipTier || 'Bronze')}}</mat-icon>
                      <div class="tier-info">
                        <span class="tier-name">{{association.partnershipTier || 'Bronze'}}</span>
                        <span class="tier-description">{{getTierDescription(association.partnershipTier || 'Bronze')}}</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-content">
                    <div class="quote-text">
                      {{association.description | slice:0:120}}...
                    </div>
                    <div class="profile-info">
                      <div class="profile-image">
                        <img [src]="getRecommendedPartnerLogo(association)"
                             [alt]="association.associationName"
                             [ngStyle]="{'object-fit': 'cover', 'width': '100%', 'height': '100%'}"
                        >
                      </div>
                      <div class="profile-details">
                        <h4 class="profile-name">{{association.associationName}}</h4>
                        <p class="profile-role">
                          <i class="uil uil-map-marker"></i>
                          {{association.associationAddress}}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </swiper-slide>
            </swiper-container>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .section {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
      padding: 100px 0;
    }

    .video-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    .background-video {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-width: 100%;
      min-height: 100%;
      width: auto;
      height: auto;
      z-index: -1;
      object-fit: cover;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
    }

    .testimonial-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      width: 400px;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      margin: 0 auto;
      transition: all 0.4s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .testimonial-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
    }

    .card-header {
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
    }

    .tier-badge {
      display: inline-flex;
      align-items: center;
      padding: 12px 20px;
      border-radius: 20px;
      font-weight: 600;
      gap: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      margin-bottom: 15px;
      backdrop-filter: blur(10px);
    }

    .tier-info {
      display: flex;
      flex-direction: column;
    }

    .tier-name {
      font-size: 1.1rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .tier-description {
      font-size: 0.8rem;
      opacity: 0.9;
    }

    .tier-gold {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: #000;
      border: 1px solid rgba(255, 215, 0, 0.3);
    }

    .tier-silver {
      background: linear-gradient(135deg, #C0C0C0, #A9A9A9);
      color: #000;
      border: 1px solid rgba(192, 192, 192, 0.3);
    }

    .tier-bronze {
      background: linear-gradient(135deg, #CD7F32, #8B4513);
      color: #fff;
      border: 1px solid rgba(205, 127, 50, 0.3);
    }

    .tier-badge mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tier-gold mat-icon {
      color: #B8860B;
    }

    .tier-silver mat-icon {
      color: #4A4A4A;
    }

    .tier-bronze mat-icon {
      color: #fff;
    }

    .quote-text {
      color: #2D3748;
      font-size: 1.1rem;
      line-height: 1.7;
      font-style: italic;
      margin-bottom: 30px;
      min-height: 100px;
      position: relative;
      padding-left: 20px;
    }

    .quote-text::before {
      content: '"';
      position: absolute;
      left: -10px;
      top: -20px;
      font-size: 4rem;
      color: #4A6CF7;
      opacity: 0.2;
    }

    .profile-info {
      display: flex;
      align-items: center;
      gap: 15px;
      padding-top: 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .profile-image {
      width: 65px;
      height: 65px;
      border-radius: 15px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
      border: 3px solid #fff;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .profile-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .profile-image:hover img {
      transform: scale(1.1);
    }

    .profile-details {
      flex-grow: 1;
    }

    .profile-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1A202C;
      margin: 0 0 5px 0;
      background: linear-gradient(45deg, #2D3748, #4A5568);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .profile-role {
      font-size: 0.9rem;
      color: #718096;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .profile-role i {
      color: #4A6CF7;
    }

    swiper-container {
      padding: 40px 0;
      overflow: visible;
    }

    swiper-slide {
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.5s ease;
      opacity: 0.5;
      transform: scale(0.9);
    }

    :host ::ng-deep .swiper-slide-active {
      opacity: 1;
      transform: scale(1);
    }

    :host ::ng-deep .swiper-pagination {
      bottom: -30px;
    }

    :host ::ng-deep .swiper-pagination-bullet {
      width: 10px;
      height: 10px;
      background: rgba(255, 255, 255, 0.5);
      opacity: 1;
      transition: all 0.3s ease;
    }

    :host ::ng-deep .swiper-pagination-bullet-active {
      background: white;
      transform: scale(1.3);
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    .section-title {
      margin-bottom: 50px;
    }

    .title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(45deg, #fff, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      position: relative;
      display: inline-block;
    }

    .title::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 3px;
      background: linear-gradient(45deg, #4A6CF7, transparent);
    }

    .para-desc {
      font-size: 1.1rem;
      max-width: 600px;
      line-height: 1.8;
    }

    @media (max-width: 768px) {
      .testimonial-card {
        width: 320px;
        padding: 20px;
      }

      .quote-text {
        font-size: 1rem;
        min-height: 80px;
      }

      .profile-name {
        font-size: 1.1rem;
      }

      .profile-role {
        font-size: 0.8rem;
      }

      .title {
        font-size: 2rem;
      }

      .para-desc {
        font-size: 1rem;
      }
    }
  `]
})
export class TopAssociationsSliderComponent implements OnInit, AfterViewInit {
  @ViewChild('swiperRef') swiperRef!: ElementRef;
  topAssociations: Association[] = [];
  public defaultLogoPath = '/assets/images/default-logo.jpg';
  private imageCache: Map<string, SafeUrl> = new Map();
  potentialPartnerLogos: { [id: number]: SafeUrl } = {};

  constructor(
    private associationService: AssociationService,
    private authService: AuthService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadTopAssociations();
    this.setupWeeklyTierUpdate();
  }

  ngAfterViewInit() {
    const swiperEl = this.swiperRef.nativeElement;
    const params = {
      slidesPerView: 1,
      spaceBetween: 30,
      centeredSlides: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false
      },
      pagination: {
        clickable: true,
        dynamicBullets: true
      },
      navigation: true,
      breakpoints: {
        640: {
          slidesPerView: 1,
          spaceBetween: 20
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30
        }
      }
    };

    Object.assign(swiperEl, params);
    swiperEl.initialize();
  }

  private loadTopAssociations(): void {
    this.associationService.getAllAssociations().subscribe({
      next: (associations: Association[]) => {
        this.topAssociations = associations
          .filter(a => a.partnershipScore !== undefined)
          .sort((a, b) => (b.partnershipScore || 0) - (a.partnershipScore || 0))
          .slice(0, 3);
        
        this.topAssociations.forEach(association => {
          if (association.associationLogoPath) {
            this.loadImage(association.associationLogoPath);
          }
        });
      },
      error: (error: Error) => {
        this.toastr.error('Failed to load top associations');
      }
    });
  }

  private loadImage(filename: string): void {
    this.associationService.getAssociationLogo(filename).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.potentialPartnerLogos[this.topAssociations.findIndex(a => a.associationLogoPath === filename)] = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: () => {
        this.potentialPartnerLogos[this.topAssociations.findIndex(a => a.associationLogoPath === filename)] = this.sanitizer.bypassSecurityTrustUrl(this.defaultLogoPath);
      }
    });
  }

  getRecommendedPartnerLogo(partner: any): SafeUrl {
    if (!partner?.associationLogoPath) {
      return this.sanitizer.bypassSecurityTrustUrl(this.defaultLogoPath);
    }

    // Check if we already have the logo loaded
    if (this.potentialPartnerLogos[this.topAssociations.findIndex(a => a.associationLogoPath === partner.associationLogoPath)]) {
      return this.potentialPartnerLogos[this.topAssociations.findIndex(a => a.associationLogoPath === partner.associationLogoPath)];
    }

    // Load the logo if not already loaded
    this.associationService.getAssociationLogo(partner.associationLogoPath).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.potentialPartnerLogos[this.topAssociations.findIndex(a => a.associationLogoPath === partner.associationLogoPath)] = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: () => {
        this.potentialPartnerLogos[this.topAssociations.findIndex(a => a.associationLogoPath === partner.associationLogoPath)] = this.sanitizer.bypassSecurityTrustUrl(this.defaultLogoPath);
      }
    });

    // Return default while loading
    return this.sanitizer.bypassSecurityTrustUrl(this.defaultLogoPath);
  }

  handleImageError(event: any) {
    const imgElement = event.target;
    if (imgElement && imgElement.src !== this.defaultLogoPath) {
      imgElement.src = this.defaultLogoPath;
      imgElement.onerror = null;
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private setupWeeklyTierUpdate(): void {
    // Check if it's Monday and if we haven't run the update today
    const now = new Date();
    if (now.getDay() === 1) { // 0 is Sunday, 1 is Monday
      const lastUpdate = localStorage.getItem('lastTierUpdate');
      const today = now.toDateString();
      
      if (lastUpdate !== today) {
        this.updateAssociationTiers();
        localStorage.setItem('lastTierUpdate', today);
      }
    }
  }

  private updateAssociationTiers(): void {
    this.associationService.updateAllTiers().subscribe({
      next: () => {
        this.loadTopAssociations();
        this.toastr.success('Partnership tiers have been updated');
      },
      error: () => {
        this.toastr.error('Failed to update partnership tiers');
      }
    });
  }

  getTierIcon(tier: string): string {
    switch (tier.toLowerCase()) {
      case 'gold':
        return 'military_tech';
      case 'silver':
        return 'workspace_premium';
      case 'bronze':
        return 'emoji_events';
      default:
        return 'emoji_events';
    }
  }

  getTierClass(tier: string): string {
    const tierLower = tier.toLowerCase();
    return `tier-${tierLower}`;
  }

  getTierDescription(tier: string): string {
    switch (tier.toLowerCase()) {
      case 'gold':
        return 'Elite Partnership Status';
      case 'silver':
        return 'Distinguished Partner';
      case 'bronze':
        return 'Valued Partner';
      default:
        return 'Partner';
    }
  }
} 