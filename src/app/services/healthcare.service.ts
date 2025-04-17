import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Healthcare } from '../interfaces/Healthcare.interface';

@Injectable({
  providedIn: 'root'
})
export class HealthcareService {
  private apiUrl = 'http://localhost:8089/api/healthcare';
  private notificationUrl = 'http://localhost:8089/api/notifications';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  private handleError(error: any) {
    console.error("🛑 Erreur HTTP détectée :", error);
    if (error.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
    return throwError(() => error);
  }

  getAllHealthcare(): Observable<Healthcare[]> {
    return this.http.get<Healthcare[]>(`${this.apiUrl}/all`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(() => console.log("✅ Soins récupérés")),
      catchError(this.handleError)
    );
  }

  addHealthcare(healthcare: Healthcare): Observable<Healthcare> {
    return this.http.post<Healthcare>(`${this.apiUrl}/add`, healthcare, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(() => console.log("✅ Soin ajouté")),
      catchError(this.handleError)
    );
  }

  updateHealthcare(id: number, data: Healthcare): Observable<Healthcare> {
    return this.http.put<Healthcare>(`${this.apiUrl}/${id}`, data, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(() => console.log("✅ Soin mis à jour")),
      catchError(this.handleError)
    );
  }

  updateHealthcareStatus(id: number, status: string, bookingDate: string): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/${id}/status`,
      { status, bookingDate },
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      tap(() => console.log("✅ Statut mis à jour")),
      catchError(this.handleError)
    );
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.notificationUrl}/page`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(() => console.log("✅ Notifications récupérées")),
      catchError(this.handleError)
    );
  }
}
