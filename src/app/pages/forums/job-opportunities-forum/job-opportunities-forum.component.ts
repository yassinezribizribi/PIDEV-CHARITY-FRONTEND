import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobOfferService } from '../../../services/jof-offer.service';
import { JobOffer } from '../../../models/job-offer.model';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
  selector: 'app-job-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './job-opportunities-forum.component.html',
  styleUrls: ['./job-opportunities-forum.component.css']
})
export class JobOpportunitiesForumComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  newJobOffer: JobOffer = { idJobOffer: 0, title: '', description: '', requirements: '', isActive: true };
  loading: boolean = true;
  error: string | null = null;

  constructor(private jobService: JobOfferService) {}

  ngOnInit() {
    this.fetchJobOffers();
  }

  fetchJobOffers() {
    this.loading = true;
    this.jobService.getJobOffers().subscribe({
      next: (data) => {
        this.jobOffers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching job offers', err);
        this.error = 'Failed to load job offers.';
        this.loading = false;
      }
    });
  }

  addJobOffer() {
    if (!this.newJobOffer.title.trim() || !this.newJobOffer.description.trim() || !this.newJobOffer.requirements.trim()) {
      return;
    }

    this.jobService.createJobOffer(this.newJobOffer).subscribe({
      next: (createdJob) => {
        this.jobOffers.unshift(createdJob);
        this.newJobOffer = { idJobOffer: 0, title: '', description: '', requirements: '', isActive: true };
      },
      error: (err) => console.error('Error adding job offer', err)
    });
  }
}
