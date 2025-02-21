import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8089/api/auth/signin';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private registerUrl = 'http://localhost:8089/api/auth/signup';
  
  private http = inject(HttpClient);  // Utilisation de `inject()` au lieu d'un constructeur

  constructor() {
    const token = localStorage.getItem('auth_token');
    this.isAuthenticatedSubject.next(!!token);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrl, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
    
  }
  
  logout() {
    localStorage.removeItem('auth_token');
    this.isAuthenticatedSubject.next(false);
  }

  register(credentials: { 
    firstname: string; 
    lastname: string; 
    email: string; 
    password: string; 
    role: string;
    telephone: string;
  }): Observable<any> {
    return this.http.post(this.registerUrl, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }
  
}
