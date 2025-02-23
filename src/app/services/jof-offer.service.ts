import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobOffer } from '../models/job-offer.model';

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {

  private apiUrl = 'http://localhost:8089/api/jobOffers'; // Adjust this URL as necessary

  constructor(private http: HttpClient) {}

  getJobOffers(): Observable<JobOffer[]> {
    const token = localStorage.getItem('auth_token'); // Retrieve the token from localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<JobOffer[]>(this.apiUrl, { headers });
  }

  createJobOffer(jobOffer: JobOffer): Observable<JobOffer> {
    const token = localStorage.getItem('auth_token'); // Retrieve the token from localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<JobOffer>(this.apiUrl, jobOffer, { headers });
  }
}
