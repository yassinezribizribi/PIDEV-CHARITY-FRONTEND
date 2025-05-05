import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dons } from '../models/dons.model'; // Adjust the path as necessary
import { Page } from '../models/page.model'; // Make sure to create this interface

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
  contributeToDonation(idDonation: number, dons: Dons): Observable<Dons> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<Dons>(`${this.apiUrl}/${idDonation}/contribute`, dons, { headers });
  }

  validateDonsByAssociation(idDons: number): Observable<Dons> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<Dons>(`${this.apiUrl}/${idDons}/validate`, null, { headers });
  }

  getDonsByDonationId(donationId: number): Observable<Dons[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Dons[]>(`${this.apiUrl}/donations/${donationId}/dons`, { headers });
  }

  getDonsByAssociation(page: number = 0, size: number = 10): Observable<Page<Dons>> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    console.log('Sending request to backend with params:', {
      page: page,
      size: size,
      params: params.toString()
    });

    return this.http.get<Page<Dons>>(`${this.apiUrl}/by-association`, { headers, params });
  }
  
  getUserDons(page: number = 0, size: number = 10): Observable<Page<Dons>> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Dons>>(`${this.apiUrl}/user-dons`, { headers, params });
  }

  // Update a specific don
  updateUserDons(donsId: number, dons: Partial<Dons>): Observable<Dons> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<Dons>(`${this.apiUrl}/updateDons/${donsId}`, dons, { headers });
  }

  // Delete a specific don
  deleteUserDons(donsId: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.delete<void>(`${this.apiUrl}/deleteDons/${donsId}`, { headers });
  }

  // Get a specific don for authenticated user
  getUserDonsById(donsId: number): Observable<Dons> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Dons>(`${this.apiUrl}/getDonsForUserById/${donsId}`, { headers });
  }

  // Validate donation by QR code
  validateDonationByQrCode(idDons: number): Observable<{ message: string }> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<{ message: string }>(`${this.apiUrl}/donation/validate/${idDons}`, { headers });
  }

  // Update a donation without authentication
  updateDonsNonAuth(donationId: number, token: string, dons: Partial<Dons>): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    // Make sure the token is properly encoded for the URL
    const encodedToken = encodeURIComponent(token);
    
    // Updated to match the controller endpoint: /update-dons/nonauth/{donationId}?token={token}
    // Set responseType to 'text' to handle empty responses correctly
    return this.http.post<any>(`${this.apiUrl}/update-dons/nonauth/${donationId}?token=${encodedToken}`, dons, { 
      headers,
      responseType: 'text' as 'json' // This tells Angular to expect a text response
    });
  }
}
