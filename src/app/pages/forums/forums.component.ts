import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-forums',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterModule,
    NavbarComponent,
    FooterComponent,
    FaqComponent,
    ScrollToTopComponent
  ],
  template: `
    <app-navbar />

    <!-- Hero Section -->
    <section class="bg-half-170 d-table w-100" style="background: url('assets/images/hero/pages.jpg') center;">
      <div class="bg-overlay bg-gradient-overlay"></div>
      <div class="container position-relative">
        <div class="row mt-5 justify-content-center">
          <div class="col-12">
            <div class="title-heading text-center">
              <h1 class="display-5 fw-bold mb-3 text-white">Community Forums</h1>
              <br><br><br>
            
              <p class="lead text-white-50 mb-0">Connect, share, and grow with our supportive community</p>
            </div>
          </div>
        </div>

        <div class="position-middle-bottom">
          <nav aria-label="breadcrumb" class="d-block">
            <ul class="breadcrumb breadcrumb-muted mb-0 p-0">
              <li class="breadcrumb-item"><a [routerLink]="'/'">Solidarity&Refugee</a></li>
              <li class="breadcrumb-item active" aria-current="page">Forums</li>
            </ul>
          </nav>
        </div>
      </div>
    </section>

    <div class="position-relative">
      <div class="shape overflow-hidden text-white">
        <svg viewBox="0 0 2880 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z" fill="currentColor"></path>
        </svg>
      </div>
    </div>

    <!-- Forums Section -->
    <section class="section">
      <div class="container">
        <div class="row justify-content-center mb-5">
          <div class="col-lg-8 text-center">
            <h2 class="fw-bold mb-3">Join the Conversation</h2>
            <p class="text-muted mb-0">Our forums are safe spaces for discussion, support, and resource sharing within the refugee community and allies.</p>
          </div>
        </div>

        <div class="row g-4 justify-content-center">
          <!-- Job Opportunities Forum -->
          <div class="col-lg-5 col-md-6">
            <div class="card forum-card h-100 border-0 rounded-4 shadow overflow-hidden">
              <div class="forum-image-container p-4 text-center">
                <img src="assets/images/jobs.jpg" alt="Job Opportunities" class="img-fluid rounded-circle shadow" style="width: 180px; height: 180px; object-fit: cover;">
              </div>
              <div class="card-body p-4 text-center">
                <h3 class="mb-3">Job Opportunities</h3>
                <p class="text-muted mb-4">Find employment opportunities, share job search tips, and connect with employers who welcome refugee talent.</p>
                <a routerLink="/forums/job-opportunities" class="btn btn-primary rounded-pill px-4">
                  <i class="uil uil-arrow-right me-1"></i> Explore Forum
                </a>
              </div>
              <div class="card-footer bg-transparent border-0 pt-0 pb-4 text-center">
                <small class="text-muted"><i class="uil uil-users-alt me-1"></i> 1,234 active members</small>
              </div>
            </div>
          </div>

          <!-- Support Forum -->
          <div class="col-lg-5 col-md-6">
            <div class="card forum-card h-100 border-0 rounded-4 shadow overflow-hidden">
              <div class="forum-image-container p-4 text-center">
                <img src="assets/images/supp.jpeg" alt="Support Refugees" class="img-fluid rounded-circle shadow" style="width: 180px; height: 180px; object-fit: cover;">
              </div>
              <div class="card-body p-4 text-center">
                <h3 class="mb-3">Support Refugees</h3>
                <p class="text-muted mb-4">Share experiences, find emotional support, and access resources to help navigate life as a refugee or ally.</p>
                <a routerLink="/forums/support-refugees" class="btn btn-primary rounded-pill px-4">
                  <i class="uil uil-arrow-right me-1"></i> Explore Forum
                </a>
              </div>
              <div class="card-footer bg-transparent border-0 pt-0 pb-4 text-center">
                <small class="text-muted"><i class="uil uil-users-alt me-1"></i> 2,345 active members</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="container mt-100">
        <div class="row g-4">
          <div class="col-md-4">
            <div class="card border-0 text-center py-4 shadow-sm rounded-4">
              <div class="card-body">
                <h2 class="text-primary mb-1 display-5 fw-bold">5,000+</h2>
                <p class="text-muted mb-0">Community Members</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 text-center py-4 shadow-sm rounded-4">
              <div class="card-body">
                <h2 class="text-primary mb-1 display-5 fw-bold">1,200+</h2>
                <p class="text-muted mb-0">Active Discussions</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 text-center py-4 shadow-sm rounded-4">
              <div class="card-body">
                <h2 class="text-primary mb-1 display-5 fw-bold">300+</h2>
                <p class="text-muted mb-0">Success Stories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQs Section -->
      <div class="container mt-100">
        <div class="row justify-content-center">
          <div class="col-12">
            <div class="section-title text-center mb-5">
              <h2 class="fw-bold mb-3">Frequently Asked Questions</h2>
              <p class="text-muted mx-auto" style="max-width: 700px;">
                Find answers to common questions about participating in our forums, community guidelines, and how to get the most out of your experience.
              </p>
            </div>
          </div>
        </div>

        <div class="row justify-content-center">
          <div class="col-lg-9 mt-4">
            <app-faq />
          </div>
        </div>
      </div>
    </section>

    <app-footer />
    <app-scroll-to-top />
  `,
  styles: [`
    .forum-card {
      transition: all 0.3s ease;
      border: 1px solid rgba(47, 85, 212, 0.1) !important;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(47, 85, 212, 0.1) !important;
      }
    }

    .forum-image-container {
      height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .rounded-4 {
      border-radius: 1rem !important;
    }

    .mt-100 {
      margin-top: 100px;
    }

    .text-primary {
      color: #2f55d4 !important;
    }

    .btn-primary {
      background-color: #2f55d4;
      border-color: #2f55d4;
      
      &:hover {
        background-color: #2443ac;
        border-color: #2443ac;
      }
    }

    @media (max-width: 768px) {
      .forum-image-container {
        height: 180px;
      }
      
      .forum-image-container img {
        width: 140px !important;
        height: 140px !important;
      }
    }
  `]
})
export class ForumsComponent {}