// src/app/services/response.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ForumResponse } from '../models/Response.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ResponseService {
  private apiUrl = 'http://localhost:8089/api/responses'; // URL de l'API
  private apiUrlRespense = 'http://localhost:8089/api/requests/responses'; // URL de l'API

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Récupérer toutes les réponses pour une demande spécifique
  getResponsesByRequestId(requestId: number): Observable<ForumResponse[]> {
    return this.http.get<ForumResponse[]>(`${this.apiUrl}/by-request/${requestId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Ajouter une nouvelle réponse
  addResponse(response: ForumResponse, id: number): Observable<ForumResponse> {
    // Create a new response object with the current date
    const responseToCreate = {
      ...response,
      dateResponse: new Date(),
      requestId: id
    };

    return this.http.post<ForumResponse>(`${this.apiUrlRespense}/${id}`, responseToCreate, {
      headers: this.getAuthHeaders(),
    });
  }

  // Méthode pour générer les headers d'authentification
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token'); // Récupère le token
    if (!token) {
      throw new Error('Unauthorized: Token is missing');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}