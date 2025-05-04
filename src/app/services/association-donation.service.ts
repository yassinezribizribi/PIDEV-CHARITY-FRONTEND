import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donation, DonationType } from '../interfaces/donation.interface';

@Injectable({
  providedIn: 'root'
})
export class AssociationDonationService {
  private apiUrl = 'http://localhost:8089/api/donations';

  constructor(private http: HttpClient) {}

  // getDonations(): Observable<Donation[]> {
  //   const token = localStorage.getItem('auth_token');
  //   const headers = new HttpHeaders()
  //     .set('Authorization', `Bearer ${token}`)
  //     .set('Content-Type', 'application/json');

  //   return this.http.get<Donation[]>(this.apiUrl, { headers });
  // }
  getDonations(): Observable<Donation[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);
 
    return this.http.get<Donation[]>(`${this.apiUrl}/getall`, { headers });
  }
  
  getDonationById(id: number): Observable<Donation> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  
    return this.http.get<Donation>(`${this.apiUrl}/get/${id}`, { headers });
  }
  

  createDonation(donation: Partial<Donation>): Observable<Donation> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<Donation>(`${this.apiUrl}/create`, donation, { headers });
  }

  updateDonation(id: number, donation: Partial<Donation>): Observable<Donation> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<Donation>(`${this.apiUrl}/update/${id}`, donation, { headers });
  }

  deleteDonation(id: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers });
  }

  getDonationsByType(donationType: DonationType): Observable<Donation[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this.http.get<Donation[]>(`${this.apiUrl}/find/${donationType}`, { headers });
  }
  



} 