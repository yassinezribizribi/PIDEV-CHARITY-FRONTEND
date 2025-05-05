import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Notification {
  id: number;
  message: string;
  createdAt: Date;
  terminalDisease?: string;
  treatmentPlan?: string;
  bookingDate?: string;
  meetingUrl?: string;
  status?: 'PENDING' | 'PROPOSED' | 'CONFIRMED' | 'RESCHEDULED';
  proposedBookingDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:8089/api/notifications';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isHoliday(date: string | Date): boolean {
    const frenchHolidays = [
      '2025-01-01',
      '2025-04-21',
      '2025-05-01',
      '2025-05-08',
      '2025-05-29',
      '2025-06-09',
      '2025-07-14',
      '2025-08-15',
      '2025-11-01',
      '2025-11-11',
      '2025-12-25'
    ];
    const formatted = new Date(date).toISOString().split('T')[0];
    return frenchHolidays.includes(formatted);
  }
  proposeDate(healthcareId: number, date: Date): Observable<any> {
    return this.http.patch(
      `http://localhost:8089/api/healthcare/${healthcareId}/propose`,
      { proposedBookingDate: date },
      { headers: this.authService.getAuthHeaders() }
    );
  }
  
  confirmDate(healthcareId: number): Observable<any> {
    return this.http.patch(
      `http://localhost:8089/api/healthcare/${healthcareId}/confirm`,
      {},
      { headers: this.authService.getAuthHeaders() }
    );
  }
  

  getNotifications(): Observable<Notification[]> {
    return this.http.get<any[]>(`${this.baseUrl}/healthcare`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(data => data.map(n => ({
        id: n.idNotification,
        message: n.message,
        createdAt: new Date(n.createdAt),
        terminalDisease: n.terminalDisease,
        treatmentPlan: n.treatmentPlan,
        bookingDate: n.bookingDate,
        meetingUrl: n.meetingUrl,
        status: n.status,
        proposedBookingDate: n.proposedBookingDate
      }))),
      catchError(error => {
        console.error("❌ Erreur récupération notifications :", error);
        return throwError(() => new Error("Impossible de charger les notifications."));
      })
    );
  }
}