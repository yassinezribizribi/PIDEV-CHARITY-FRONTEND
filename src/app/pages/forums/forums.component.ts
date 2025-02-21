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
        RouterModule,  // Add this

        NavbarComponent,
    FooterComponent,
        FaqComponent,
        ScrollToTopComponent
  ],
  template: `
    <app-navbar />

    <!-- Hero Start -->
    <section class="bg-half-170 d-table w-100" style="background: url('assets/images/hero/pages.jpg') center;">
      <div class="bg-overlay bg-gradient-overlay"></div>
      <div class="container">
        <div class="row mt-5 justify-content-center">
          <div class="col-12">
            <div class="title-heading text-center">
              <h5 class="heading fw-semibold mb-0 sub-heading text-white title-dark">Forums</h5>
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
    <!-- Hero End -->

    <!-- Forums Section -->
    <section class="section">
      <div class="container">
        <div class="row justify-content-center">
          <!-- Job Opportunities Forum -->
          <div class="col-lg-6 col-md-6 mt-4 pt-2">
            <div class="card features feature-primary feature-clean explore-feature p-4 px-md-3 border-0 rounded-4 shadow text-center">
              <div class="icons text-center mx-auto">
                <i class="uil uil-briefcase-alt d-block rounded h3 mb-0"></i>
              </div>
              <div class="card-body p-0 mt-4">
                <h5 class="mb-3">Job Opportunities</h5>
                <p class="text-muted mb-3">Find and discuss job opportunities, share experiences, and connect with employers.</p>
                <a routerLink="/forums/job-opportunities" class="text-primary">Join Discussion</a>
              </div>
            </div>
          </div>

          <!-- General Discussion Forum -->
          <div class="col-lg-6 col-md-6 mt-4 pt-2">
            <div class="card features feature-primary feature-clean explore-feature p-4 px-md-3 border-0 rounded-4 shadow text-center">
              <div class="icons text-center mx-auto">
                <i class="uil uil-comments-alt d-block rounded h3 mb-0"></i>
              </div>
              <div class="card-body p-0 mt-4">
                <h5 class="mb-3">Support Refugees</h5>
                <p class="text-muted mb-3">Connect with the community, share stories, and get support from others.</p>
                <a routerLink="/forums/support-refugees" class="text-primary">Join Discussion</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQs Section -->
      <div class="container mt-100 mt-60">
        <div class="row justify-content-center">
          <div class="col-12">
            <div class="section-title text-center mb-4 pb-2">
              <h4 class="mb-4 title">FAQs</h4>
              <p class="para-desc mx-auto text-muted">Find answers to commonly asked questions about our forums and community guidelines.</p>
            </div>
          </div>
        </div>

        <div class="row justify-content-center">
          <div class="col-lg-9 mt-4 pt-2">
            <app-faq />
          </div>
        </div>
      </div>
    </section>

    <app-footer />
    <app-scroll-to-top />
  `,
  styles: [`
    .rounded-4 {
      border-radius: 1rem !important;
    }

    .feature-primary {
      transition: all 0.5s ease;
      
      .icons {
        height: 65px;
        width: 65px;
        line-height: 65px;
        background-color: rgba(47, 85, 212, 0.1);
        border-radius: 50%;
        
        i {
          font-size: 30px;
          color: #2f55d4;
        }
      }

      &:hover {
        transform: translateY(-10px);
        
        .icons {
          background-color: #2f55d4;
          
          i {
            color: white;
          }
        }
      }
    }

    .text-primary {
      color: #2f55d4 !important;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }

    .mt-100 {
      margin-top: 100px;
    }

    .mt-60 {
      margin-top: 60px;
    }
  `]
})
export class ForumsComponent {}
