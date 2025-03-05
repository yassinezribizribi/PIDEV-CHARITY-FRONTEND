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
    const token = localStorage.getItem('auth_token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    console.log('Headers:', headers);
    console.log('Payload:', jobOffer);
  
    return this.http.post<JobOffer>(this.apiUrl, jobOffer, { headers });
  }
  
  

  updateJobOffer(jobOffer: JobOffer): Observable<JobOffer> {
    const token = localStorage.getItem('auth_token'); // Retrieve the token from localStorage
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');  // Explicitly set Content-Type to application/json

    return this.http.put<JobOffer>(`${this.apiUrl}/${jobOffer.idJobOffer}`, jobOffer, { headers });
  }
}
