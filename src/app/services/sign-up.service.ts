import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private apiUrl = 'http://localhost:8089/api/auth/signup';
  private http = inject(HttpClient);

  register(user: { email: string; password: string; role: string; firstname: string; lastname: string; telephone: string; job: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, JSON.stringify(user), { headers });
}

  
}
