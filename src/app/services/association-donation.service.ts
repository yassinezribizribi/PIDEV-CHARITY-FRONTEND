import { Injectable } from '@angular/core'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donation, DonationType, CagnotteEnligne } from '../interfaces/donation.interface';

interface DonationExtensionSuggestion {
  suggestedDays: number;
  message: string;
  donationProgress: number;
  cagnotteProgress: number;
  donationDailyAvg: number;
  cagnotteDailyAvg: number;
  donationRemaining: number;
  cagnotteRemaining: number;
  donationEstimatedDays: number;
  cagnotteEstimatedDays: number;
}

@Injectable({
  providedIn: 'root'
})
export class AssociationDonationService {
  private apiUrl = 'http://localhost:8089/api/donations';

  constructor(private http: HttpClient) {}

  // Get all ACTIVE donations (sorted) — NO authentication required
  getDonations(): Observable<Donation[]> {
    return this.http.get<Donation[]>(`${this.apiUrl}/sorted-active`);
  }

  // Authenticated endpoints below
  getDonationsByAssociation(): Observable<Donation[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<Donation[]>(`${this.apiUrl}/my-donations`, { headers });
  }

  getDonationById(id: number): Observable<Donation> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<Donation>(`${this.apiUrl}/get/${id}`, { headers });
  }

  getCagnotteByDonationId(id: number): Observable<CagnotteEnligne> {
    return this.http.get<CagnotteEnligne>(`${this.apiUrl}/cagnotte/${id}`);
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

  suggestExtension(id: number): Observable<DonationExtensionSuggestion> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<DonationExtensionSuggestion>(`${this.apiUrl}/donation/${id}/suggest-extension`, { headers });
  }

  prolongDonation(id: number, daysToExtend: number): Observable<string> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    
    return this.http.post<string>(`${this.apiUrl}/donation/${id}/apply-extension`, 
      { daysToExtend }, 
      { headers }
    );
  }
}