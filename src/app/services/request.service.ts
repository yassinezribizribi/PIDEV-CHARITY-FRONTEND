// src/app/services/request.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private baseUrl = 'http://localhost:8089/api/requests'; // Adjust your backend URL

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Add a new support request
  addRequest(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, request, {
      headers: this.authService.getAuthHeaders(),
    });
  }
  getAllRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
