import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Response } from '../models/Response.model';  // Assurez-vous d'avoir le bon modèle pour la réponse

@Injectable({
  providedIn: 'root'
})
export class ResponseService {
  private apiUrl = 'http://localhost:8089/api/responses'; // Changez l'URL selon l'API
    authService: any;

  constructor(private http: HttpClient) {}

  // Ajouter une réponse
  addResponse(responseData: Response): Observable<Response> {
    const userId = this.authService.getUserId(); // Obtient l'ID de l'utilisateur
    if (!userId) {
      console.error("User ID not found!");
      return throwError(() => new Error("User ID not found"));
    }
  
    responseData.idSender = userId;  // Ajoute l'ID de l'utilisateur à la réponse
    return this.http.post<Response>(`${this.apiUrl}/add`, responseData);
  }
  

  // Récupérer toutes les réponses par l'ID de la requête
  getAllResponsesByRequest(idRequest: number): Observable<Response[]> {
    return this.http.get<Response[]>(`${this.apiUrl}/request/${idRequest}`);
  }
}
