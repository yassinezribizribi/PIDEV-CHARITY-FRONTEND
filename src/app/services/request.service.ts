// src/app/services/request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Request } from '../models/Request.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private apiUrl = 'http://localhost:8089/api/requests'; // URL de l'API

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Récupérer toutes les demandes
  getAllRequests(): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders(),
    });
  }
  addRequest(request: Request): Observable<Request> {
    // Récupérer l'ID de l'utilisateur connecté
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User ID not found');
    }

    // Associer l'ID de l'utilisateur à la demande

    // Envoyer la demande au backend
    return this.http.post<Request>(`${this.apiUrl}/add`, request, {
      headers: this.getAuthHeaders(), // Ajouter les headers d'authentification
    });
  }

  // Méthode pour générer les headers d'authentification
 


  // Récupérer une demande par ID
  getRequestById(id: number): Observable<Request> {
    return this.http.get<Request>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Ajouter une réponse à une demande
  addResponseToRequest(requestId: number, response: Response): Observable<Response> {
    return this.http.post<Response>(
      `${this.apiUrl}/${requestId}/responses`,
      response,
      { headers: this.getAuthHeaders() }
    );
  }

  // Méthode pour générer les headers d'authentification
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token'); // Récupère le token
    if (!token) {
      throw new Error('Unauthorized: Token is missing');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllRequestsWithResponses(): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/requests-with-responses`, {
      headers: this.getAuthHeaders(),
    });
  }
  
}