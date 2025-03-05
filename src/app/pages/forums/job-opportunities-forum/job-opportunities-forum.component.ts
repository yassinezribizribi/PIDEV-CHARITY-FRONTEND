import { Component, OnInit, Inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEvent, HttpHeaders, HttpResponse } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt'; // Import the JWT helper library (if not already imported)

import { JobOfferService } from '../../../services/jof-offer.service';
import { JobApplicationService } from '../../../services/job-application.service';
import { JobOffer } from '../../../models/job-offer.model';
import { JobApplication, JobApplicationStatus } from '../../../models/job-application.model';            

import { RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';

@Component({
  selector: 'app-job-opportunities-forum',
  templateUrl: './job-opportunities-forum.component.html',
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent], 
  standalone: true,
  providers: [JobOfferService, JobApplicationService],    
  styleUrls: ['./job-opportunities-forum.component.css']
})
export class JobOpportunitiesForumComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  newJobOffer: JobOffer = { idJobOffer: 0, title: '', description: '', requirements: '', isActive: true,forumId:1 };
  loading: boolean = true;
  error: string | null = null;

  constructor(
    @Inject(JobOfferService) private jobService: JobOfferService,
    @Inject(JobApplicationService) private jobApplicationService: JobApplicationService,
  ) {}

  ngOnInit() {
    this.fetchJobOffers();
  }

  fetchJobOffers() {
    this.loading = true;
    this.jobService.getJobOffers().subscribe({
      next: (data: any) => {
        try {
          // Log the raw data to inspect its structure
          console.log('Received data:', data);
  
          // If data is a string, attempt to fix it
          if (typeof data === 'string') {
            // Remove trailing invalid characters (e.g., circular reference artifacts)
            const correctedData = data.replace(/]}}]+$/, "]");
            this.jobOffers = JSON.parse(correctedData);
          } else {
            this.jobOffers = data;
          }
        } catch (e) {
          console.error('Malformed JSON:', e);
          this.error = 'Error parsing job offers data';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error fetching job offers';
        console.error('Error details:', err);
        this.loading = false;
      }
    });
  }
  

  addJobOffer() {
    // Remove idJobOffer or set it to null for new entities
    const payload = {
      title: this.newJobOffer.title,
      description: this.newJobOffer.description,
      requirements: this.newJobOffer.requirements,
      isActive: this.newJobOffer.isActive,
      forumId: this.newJobOffer.forumId  // Ajoute cet attribut si nécessaire
  };
  

    this.jobService.createJobOffer(payload).subscribe({
        next: (createdJob: JobOffer) => {
            this.jobOffers.push(createdJob);
            this.newJobOffer = { idJobOffer: 0, title: '', description: '', requirements: '', isActive: true,forumId:1 };
        },
        error: (err: any) => {
            console.error('Error adding job offer:', err);
        }
    });
}

  toggleJobStatus(job: JobOffer) {
    job.isActive = !job.isActive;
    this.jobService.updateJobOffer(job).subscribe({
      next: () => console.log('Job status updated'),
      error: (err: any) => console.error('Error updating job status', err),
    });
  }
  
  applyForJob(jobOfferId: number) {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.error('No token found in localStorage!');
      return;
    }
  
    const jwtHelper = new JwtHelperService();
    const decodedToken = jwtHelper.decodeToken(token);
    console.log('Decoded Token:', decodedToken);
  
    const userId = decodedToken?.userId || decodedToken?.sub;
    if (!userId) {
      console.error('User ID not found in token!', decodedToken);
      return;
    }
  
    // Now include the jobOfferId in the JobApplication
    const jobApplication: JobApplication = {
      idApplication: undefined, // The ID will be generated on the backend
      applicationDate: new Date(),
      jobApplicationStatus: JobApplicationStatus.PENDING,
      jobOfferId: jobOfferId,  // Ensure jobOfferId is included
      userId: userId
    };
  
    // Now call the createJobApplication method with the jobOfferId in the URL
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.jobApplicationService.createJobApplication(jobOfferId, jobApplication).subscribe({
      next: (response) => {
        console.log('Application submitted successfully', response);
        // Optionally, handle a successful response (e.g., show a message or update UI)
      },
      error: (err) => {
        console.error('Error submitting job application', err);
        // Optionally, handle error feedback (e.g., show an error message)
      }
    });
  }
  
}
