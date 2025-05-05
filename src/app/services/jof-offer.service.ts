import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { JobOffer, JobOfferReport } from '../models/job-offer.model';
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
  createJobOffer(jobOffer: {
    title: string;
    description: string;
    requirements: string;
    active: boolean;
    createdAt: string;
    createdById: number;
    forumId: number;
  }): Observable<JobOffer> {
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

  // Report a job offer
  reportJobOffer(jobOfferId: number, reporterId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${jobOfferId}/report`,
      null,
      { 
        headers: this.getHeaders(),
        params: new HttpParams().set('reporterId', reporterId.toString())
      }
    ).pipe(
      map(response => {
        return {
          success: true,
          message: response
        };
      }),
      catchError(error => {
        console.error('Error reporting job offer:', error);
        return of({
          success: false,
          message: error.error || 'Failed to report job offer'
        });
      })
    );
  }

  // Get report count for a job offer
  getJobOfferReportCount(jobOfferId: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/${jobOfferId}/reports`,
      { 
        headers: this.getHeaders(),
        responseType: 'json' as const
      }
    ).pipe(
      map(count => count || 0),
      catchError(error => {
        console.error('Error getting report count:', error);
        return of(0);
      })
    );
  }

  // Get reports for a specific job offer
  getJobOfferReports(jobOfferId: number): Observable<JobOfferReport[]> {
    return this.http.get<JobOfferReport[]>(
      `${this.apiUrl}/${jobOfferId}/reports`,
      { headers: this.getHeaders() }
    );
  }

  // Update report status
  updateReportStatus(reportId: number, status: 'PENDING' | 'REVIEWED' | 'RESOLVED'): Observable<JobOfferReport> {
    return this.http.put<JobOfferReport>(
      `${this.apiUrl}/reports/${reportId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  // Get all reported job offers
  getReportedJobOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(
      `${this.apiUrl}/reported`,
      { headers: this.getHeaders() }
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

  updateUser(user: { idUser: number; firstName: string; lastName: string; photo?: string | null; isBanned?: boolean; banreason?: string | null }) {
    return this.http.put(`${this.apiUrl}/users/${user.idUser}/ban`, null, {
      headers: this.authService.getAuthHeaders(),
      params: new HttpParams()
        .set('isBanned', user.isBanned?.toString() || 'false')
        .set('banReason', user.banreason || '')
    });
  }
}