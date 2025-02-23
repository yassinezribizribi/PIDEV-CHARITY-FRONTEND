import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private apiUrl = 'http://localhost:8089/api/auth/signup';
 // private http = inject(HttpClient);
  constructor(private http: HttpClient) {}

  register(user: { email: string; password: string; role: string; firstName: string; lastName: string; telephone: string; job: string }): Observable<any> {
    console.log(user)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, user,{headers});
}

  
}
