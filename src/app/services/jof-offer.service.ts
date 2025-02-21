import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobOfferService {
  private apiUrl = 'http://localhost:8089/api/joboffers'; // Your Spring Boot API

  constructor(private http: HttpClient) {}

  addJobOffer(jobOffer: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, jobOffer);
  }
  getJobOffers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  getJobOfferById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  updateJobOffer(id: string, jobOffer: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, jobOffer);
  }
  deleteJobOffer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  } 
}
