import { Component, OnInit } from '@angular/core';
import { JobOfferService } from '../services/jof-offer.service';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { JobOffer } from '../models/job-offer.model';
import { JobApplication } from '../models/job-application.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [RouterLink, NavbarComponent, CommonModule, DatePipe]
})
export class ProfileComponent implements OnInit {
  currentUser: any;
  userJobOffers: JobOffer[] = [];
  jobApplications: JobApplication[] = [];
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private jobOfferService: JobOfferService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      console.error('User not authenticated');
      return;
    }
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading = true;
    const userId = this.authService.getUserId();
    
    if (!userId) {
      console.error('User not authenticated');
      this.loading = false;
      return;
    }

    this.jobOfferService.getJobOffersByUser(userId).subscribe({
      next: (userOffers) => {
        this.userJobOffers = userOffers;
        if (this.userJobOffers.length > 0) {
          this.loadJobApplications(userId);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching job offers:', err);
        this.loading = false;
      }
    });
  }

  loadJobApplications(userId: number) {
    this.jobOfferService.getApplicationsForUserJobOffers(userId)
      .subscribe({
        next: (applications: JobApplication[]) => {
          this.jobApplications = applications;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching applications:', err);
          this.loading = false;
        }
      });
  }

  getApplicationsForJobOffer(jobOfferId?: number): JobApplication[] {
    if (!jobOfferId) return [];
    return this.jobApplications.filter(app => app.jobOfferId === jobOfferId);
  }

  viewApplications(jobOfferId?: number) {
    if (!jobOfferId) return;
    this.router.navigate(['/jobApplications', jobOfferId]);
  }

  logout() {
    this.authService.logout();
  }
}