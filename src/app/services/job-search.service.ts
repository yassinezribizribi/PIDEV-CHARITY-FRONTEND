import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobPosting } from '../interfaces/employment.interface'; 

@Injectable({
  providedIn: 'root'
})
export class JobSearchService {
  private apiUrl = 'http://localhost:8080/api/jobs'; // URL du backend Spring Boot

  constructor(private http: HttpClient) {}

  getJobs(): Observable<JobPosting[]> {
    return this.http.get<JobPosting[]>(this.apiUrl);
  }

  applyForJob(jobId: string, userId: string, resume: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${jobId}/apply`, { userId, resume });
  }
}
