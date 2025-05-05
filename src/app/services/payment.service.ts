import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DonationSuggestionDTO } from '../interfaces/donation.interface';
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/paiments`;

  constructor(private http: HttpClient) {}

  // Public: Create Stripe payment intent, now including cagnotteId in the URL
  createPaymentIntent(amount: number, cagnotteId: number, currency: string = "eur"): Observable<{ clientSecret: string }> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  
    const body = { amount, currency };
  
    return this.http.post<{ clientSecret: string }>(
      `${this.apiUrl}/create-payment-intent/${cagnotteId}`,
      body,
      { headers }
    );
  }
  
  // Public: Get a payment by its ID
  getPaymentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Public: Get all payments related to a cagnotte
  getPaymentsByCagnotteId(cagnotteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cagnotte/${cagnotteId}`);
  }
 // Get donation suggestions based on cagnotte ID and amount
  // Get donation suggestions based on cagnotte ID and amount
 // 4) Get donation suggestions (anonymous or registered users)
 getDonationSuggestions(
  cagnotteId: number,
  input?: number
): Observable<DonationSuggestionDTO> {
  const token = localStorage.getItem('auth_token');
  let headers = new HttpHeaders();

  // Only add Authorization header if token exists
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  let url = `${this.apiUrl}/cagnotte/suggestions/${cagnotteId}`;
  // Only add input parameter if it's defined and not null
  if (input !== undefined && input !== null) {
    url += `?input=${input}`;
  }

  return this.http.get<DonationSuggestionDTO>(url, { headers });
}

  // Get a random "spin the wheel" donation suggestion
 //getWheelSuggestion(cagnotteId: number, userInput: number): Observable<number> {
 //return this.http.get<number>(`${this.apiUrl}/spin/${cagnotteId}?userInput=${userInput}`);
 //}


// ✅ Get wheel-based suggestions (6 amounts)
getWheelSuggestions(cagnotteId: number, userInput?: number): Observable<number[]> {
  const token = localStorage.getItem('auth_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  const url = userInput !== undefined
    ? `${this.apiUrl}/spin/${cagnotteId}?userInput=${userInput}`
    : `${this.apiUrl}/spin/${cagnotteId}`;

  return this.http.get<number[]>(url, { headers });
}

}
