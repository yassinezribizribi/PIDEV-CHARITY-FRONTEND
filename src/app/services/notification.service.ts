import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:8089/api/notifications';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // ✅ Récupérer les notifications du patient connecté
  getNotifications(): Observable<any[]> {
    const userId = this.authService.getUserId();
    const headers = this.authService.getAuthHeaders();

    return this.http.get<any[]>(`${this.baseUrl}/user/${userId}`, { headers }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors de la récupération des notifications :", error);
        return throwError(() => new Error("Impossible de charger les notifications."));
      })
    );
  }

  // ✅ Nouvelle méthode pour envoyer une notification après MAJ de soin
  sendHealthcareNotification(patientId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/healthcare-update/${patientId}`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors de l'envoi de notification soin :", error);
        return throwError(() => new Error("Erreur d'envoi de notification."));
      })
    );
  }

  // ✅ Nouvelle méthode pour notification de visioconférence
  sendVideoNotification(patientId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/video-call/${patientId}`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors de la notification vidéo :", error);
        return throwError(() => new Error("Erreur d'envoi de notification vidéo."));
      })
    );
  }
}
