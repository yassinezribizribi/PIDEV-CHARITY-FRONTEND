import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '../models/Response.model';

@Injectable({
  providedIn: 'root'
})
export class ResponseService {
  private apiUrl = 'http://localhost:8089/api/responses';

  constructor(private http: HttpClient) {}

  getResponsesByRequestId(requestId: number): Observable<Response[]> {
    return this.http.get<Response[]>(`${this.apiUrl}/request/${requestId}`);
  }

  addResponse(response: Response): Observable<Response> {
    return this.http.post<Response>(`${this.apiUrl}/add`, response);
  }

  deleteResponse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
