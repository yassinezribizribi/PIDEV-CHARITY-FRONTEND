import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Request } from '../models/Request.model'; // Assurez-vous d'importer le modèle Request

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private apiUrl = 'http://localhost:8089/api/requests'; // URL de l'API

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Récupérer toutes les demandes de support
  getAllRequests(): Observable<Request[]> {
    const token = localStorage.getItem('auth_token'); // Récupère le token
    if (!token) {
      console.error('Token not found! User might not be logged in.');
      return throwError(() => new Error('Unauthorized: Token is missing'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Ajouter le token

    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers }).pipe(
      map((requests) =>
        requests.map((request) => ({
          idRequest: request.idRequest, // Mapping idRequest -> id
          idSender: request.idSender,
          idReceiver: request.idReceiver,
          dateRequest: request.dateRequest, // Mapping requestDate -> date
          object: request.object,
          content: request.content,
          isUrgent: request.isUrgent,
          responses: request.responses, // Liste des réponses
          forum: request.forum, // Forum lié à la demande
        }))
      )
    );
  }
  // Ajouter une nouvelle demande de support
  addRequest(request: Request): Observable<Request> {
    const userId = this.authService.getUserId(); // Récupérer l'ID de l'utilisateur connecté
    if (!userId) {
      console.error('User ID not found!');
      return throwError(() => new Error('User ID not found'));
    }


    return this.http.post<Request>(`${this.apiUrl}/add`, request, {
      headers: this.authService.getAuthHeaders(), // Utiliser les headers d'authentification
    });
  }
/*
  // Supprimer une demande par ID
  deleteRequest(id: number): Observable<void> {
    const token = localStorage.getItem('auth_token'); // Récupérer le token
    if (!token) {
      console.error('Token not found! User might not be logged in.');
      return throwError(() => new Error('Unauthorized: Token is missing'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers });
  }

  // Mettre à jour une demande
  updateRequest(idRequest: number, requestData: Request): Observable<Request> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<Request>(`${this.apiUrl}/update/${idRequest}`, requestData, { headers });
  }*/

    getRequestById(id: number): Observable<Request> {
      const headers = this.authService.getAuthHeaders();
      return this.http.get<Request>(`${this.apiUrl}/${id}`, { headers });
    }
    

addResponseToRequest(requestId: number, responseData : any): Observable<any> {
  const token = localStorage.getItem('auth_token'); // Récupère le token
  if (!token) {
    console.error('Token not found! User might not be logged in.');
    return throwError(() => new Error('Unauthorized: Token is missing'));
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.post<any>(`${this.apiUrl}/${requestId}/responses`, responseData, { headers });
}
}
