import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dons } from '../models/dons.model'; // Adjust the path as necessary

@Injectable({
  providedIn: 'root'
})
export class DonsService {
  private apiUrl = 'http://localhost:8089/api/dons'; // Adjust to your actual API URL

  constructor(private http: HttpClient) {}

  // Get all donations
  getDons(): Observable<Dons[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Dons[]>(this.apiUrl, { headers });
  }

  // Get a donation by its ID
  getDonsById(id: number): Observable<Dons> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Dons>(`${this.apiUrl}/${id}`, { headers });
  }

  // Create a new donation (for contributing)
  createDons(dons: Partial<Dons>): Observable<Dons> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<Dons>(`${this.apiUrl}/contribute`, dons, { headers });
  }

  // Update a donation
  updateDons(id: number, dons: Partial<Dons>): Observable<Dons> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<Dons>(`${this.apiUrl}/${id}`, dons, { headers });
  }

  // Delete a donation
  deleteDons(id: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  // Method to contribute to a specific donation
  contributeToDonation(idDonation: number, donation: Partial<Dons>): Observable<Dons> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    // Correct endpoint to match the backend method
    return this.http.post<Dons>(`${this.apiUrl}/${idDonation}/contribute`, donation, { headers });
  }
}
