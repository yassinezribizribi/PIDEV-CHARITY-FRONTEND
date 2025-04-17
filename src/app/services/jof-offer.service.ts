import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JobOffer } from '../models/job-offer.model';
import { JobApplication } from '../models/job-application.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {
  private apiUrl = 'http://localhost:8089/api/jobOffers';
  private apiUrll = 'http://localhost:8089/api/jobApplications';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Fetch all job offers
  getJobOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Fetch job offers created by a specific user
  getJobOffersByUser(userId: number): Observable<JobOffer[]> {
    const headers = this.getHeaders();
    return this.http.get<JobOffer[]>(`${this.apiUrl}/user/${userId}`, { headers });
  }

  // Create a new job offer
  createJobOffer(jobOffer: JobOffer): Observable<JobOffer> {
    return this.http.post<JobOffer>(this.apiUrl, jobOffer, { headers: this.getHeaders() });
  }

  // Update an existing job offer
  updateJobOffer(jobOffer: JobOffer): Observable<JobOffer> {
    // Explicit payload structure to match backend DTO
    const payload = {
      idJobOffer: jobOffer.idJobOffer,
      title: jobOffer.title,
      description: jobOffer.description,
      requirements: jobOffer.requirements,
      isActive: jobOffer.active,
      createdById: jobOffer.createdBy?.idUser
    };
  
    return this.http.put<JobOffer>(
      `${this.apiUrl}/${jobOffer.idJobOffer}`, 
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Server Response:', response))
    );
  }

  // Fetch applications based on userId or jobOfferId
  getApplications(params?: { userId?: number, jobOfferId?: number }): Observable<JobApplication[]> {
    let httpParams = new HttpParams();
    
    if (params?.userId) {
      httpParams = httpParams.append('userId', params.userId.toString());
    }
    if (params?.jobOfferId) {
      httpParams = httpParams.append('jobOfferId', params.jobOfferId.toString());
    }

    return this.http.get<JobApplication[]>(`${this.apiUrll}/applications`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  // Fetch applications for job offers posted by a specific user
  getApplicationsForUserJobOffers(userId: number): Observable<JobApplication[]> {
    const headers = this.getHeaders();
    return this.http.get<JobApplication[]>(`${this.apiUrll}/job-offers/applications`, { headers });
  }

  // Fetch applications for a specific job offer
  getApplicationsForJobOffer(jobOfferId: number): Observable<JobApplication[]> {
    const headers = this.getHeaders();
    return this.http.get<JobApplication[]>(`${this.apiUrll}/job-offer/${jobOfferId}`, { headers });
  }
}