import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { JobApplication } from '../models/job-application.model';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  private apiUrl = `${environment.apiUrl}/jobApplications`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Get all job applications
  getAllJobApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Get a specific job application by ID
  getJobApplicationById(id: number): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Create a new job application
  createJobApplication(jobOfferId: number, jobApplication: JobApplication): Observable<JobApplication> {
    return this.http.post<JobApplication>(`${this.apiUrl}/${jobOfferId}`, jobApplication, { headers: this.getHeaders() });
  }

  // Delete a job application
  deleteJobApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Update the status of a job application (e.g., accept or reject)
  updateApplicationStatus(id: number, status: string): Observable<JobApplication> {
    return this.http.patch<JobApplication>(
      `${this.apiUrl}/${id}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }
  acceptApplication(id: number): Observable<JobApplication> {
    return this.http.put<JobApplication>(
      `${this.apiUrl}/${id}/accept`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  rejectApplication(id: number, reason: string = ''): Observable<JobApplication> {
    return this.http.put<JobApplication>(
      `${this.apiUrl}/${id}/reject`,
      { reason },
      { headers: this.getHeaders() }
    );
  }

  // Get all applications for a specific job offer
  getApplicationsForJobOffer(jobOfferId: number): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.apiUrl}/job-offer/${jobOfferId}`, { headers: this.getHeaders() });
  }
}