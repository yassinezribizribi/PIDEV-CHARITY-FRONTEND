import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/paiments`;

  constructor(private http: HttpClient) {}

  // Public: Create Stripe payment intent, now including cagnotteId in the URL
  createPaymentIntent(amount: number, cagnotteId: number, currency: string = 'eur'): Observable<{ clientSecret: string }> {
    return this.http.post<{ clientSecret: string }>(
      `${this.apiUrl}/create-payment-intent/${cagnotteId}`, // include cagnotteId in the URL
      { amount, currency }
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
}
