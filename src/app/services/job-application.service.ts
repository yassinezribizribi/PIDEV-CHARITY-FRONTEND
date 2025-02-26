import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { JobApplication } from '../models/job-application.model';
import { JobOfferService } from './jof-offer.service';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  private apiUrl = `${environment.apiUrl}/jobApplications`;

  constructor(private http: HttpClient, private authService: AuthService, private jobOfferService: JobOfferService) {}

  // Get headers with authorization token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // You should throw an error or handle it appropriately where this method is called
      throw new Error('No token found');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Get all job applications
  getAllJobApplications(): Observable<JobApplication[]> {
    const headers = this.getHeaders(); // Ensure headers are retrieved properly
    return this.http.get<JobApplication[]>(this.apiUrl, { headers });
  }

  // Get job application by ID
  getJobApplicationById(id: number): Observable<JobApplication> {
    const headers = this.getHeaders(); // Ensure headers are retrieved properly
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`, { headers });
  }

  // Create a job application
  createJobApplication(jobOfferId: number, jobApplication: JobApplication): Observable<JobApplication> {
    const headers = this.getHeaders();  // Ensure headers are retrieved properly
    const url = `${this.apiUrl}/${jobOfferId}`;  // Append jobOfferId to the API URL
    return this.http.post<JobApplication>(url, jobApplication, { headers });
  }
  

  // Delete job application
  deleteJobApplication(id: number): Observable<void> {
    const headers = this.getHeaders(); // Ensure headers are retrieved properly
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
