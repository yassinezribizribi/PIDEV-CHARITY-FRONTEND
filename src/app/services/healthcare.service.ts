import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Notification {
  message: string;
  createdAt: Date;
  terminalDisease?: string;
  treatmentPlan?: string;
  bookingDate?: string;
  meetingUrl?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class HealthcareService {
  private apiUrl = 'http://localhost:8089/api/healthcare';
  private notificationUrl = 'http://localhost:8089/api/notifications';
  
  private baseUrl = 'http://localhost:8089/api/healthcare';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  getAllHealthcare(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => throwError(() => new Error('Erreur chargement soins')))
    );
  }
  getMyHealthcare(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-notifications`, {
      headers: this.authService.getAuthHeaders()
    });
  }
  
  addHealthcare(healthcare: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, healthcare, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => throwError(() => new Error('Erreur ajout soin')))
    );
  }

  updateHealthcare(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => throwError(() => new Error('Erreur modification soin')))
    );
  }

  predictDiagnosis(symptoms: string): Observable<any> {
    return this.http.post("http://localhost:3000/predict", { symptoms });
  }

  getMyHealthcareNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.notificationUrl}/healthcare`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map((data: any[]) =>
        data.map(h => ({
          message: h.message,
          createdAt: new Date(h.createdAt),
          terminalDisease: h.terminalDisease,
          treatmentPlan: h.treatmentPlan,
          bookingDate: h.bookingDate,
          meetingUrl: h.meetingUrl
        }))
      ),
      catchError(error => throwError(() => new Error('Erreur chargement des notifications')))
    );
  }
  downloadReportPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob',
      headers: this.authService.getAuthHeaders() // <-- ajoute le token ici
    });
  }
  
  getNotifications(): Observable<Notification[]> {
    return this.http.get<any[]>(`${this.notificationUrl}/page`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map((data: any[]) => data.map(n => ({
        message: n.message,
        createdAt: new Date(n.createdAt),
        terminalDisease: n.terminalDisease,
        treatmentPlan: n.treatmentPlan,
        bookingDate: n.bookingDate
      }))),
      catchError(error => throwError(() => new Error('Erreur notifications')))
    );
  }

  getHealthcareReportUrl(): Observable<string> {
    return this.http.get(this.baseUrl + '/report-url', { responseType: 'text' });
  }
}