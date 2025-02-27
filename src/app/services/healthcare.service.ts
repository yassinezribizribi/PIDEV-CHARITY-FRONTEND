import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HealthcareService {
  private apiUrl = 'http://localhost:8089/api/healthcare';
  http = inject(HttpClient);
  authService = inject(AuthService);

  constructor() {}

  // ✅ Récupérer tous les soins médicaux
  getAllHealthcare(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers: this.authService.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors du chargement des soins :", error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Ajouter une demande de soin
  addHealthcare(healthcare: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, healthcare, { headers: this.authService.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors de l'ajout du soin :", error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Mettre à jour un soin
  updateHealthcare(id: number, healthcare: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, healthcare, { headers: this.authService.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors de la mise à jour :", error);
        return throwError(() => error);
      })
    );
  }
}
