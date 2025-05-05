import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IAService {
  private apiUrl = 'http://localhost:3000/predict';

  constructor(private http: HttpClient) {}

  predictDiagnosis(symptoms: string): Observable<{ diagnostic: string, treatment: string }> {
    return this.http.post<{ diagnostic: string, treatment: string }>(this.apiUrl, { symptoms });
  }
}
