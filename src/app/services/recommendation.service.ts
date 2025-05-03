import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  private apiUrlRecommendations = 'http://localhost:8089/api/recommendations';

  constructor(private http: HttpClient) {}

  getRecommendedEvents(userId: number): Observable<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }

    return this.http.get(`${this.apiUrlRecommendations}/events/${userId}`);
  }
}