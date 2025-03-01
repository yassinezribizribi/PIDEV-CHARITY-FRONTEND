import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8089/api/auth/signin';
  private registerUrl = 'http://localhost:8089/api/auth/signup';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private router = inject(Router);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const decodedToken = this.decodeToken(token);
      if (this.isTokenExpired(decodedToken.exp)) {
        this.logout();
      } else {
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(response => {
        const token = response.token;
        if (token) {
          localStorage.setItem('auth_token', token);
          this.isAuthenticatedSubject.next(true);
          console.log('Token saved:', token);
          this.router.navigate(['/index']);
        }
      })
    );
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  fetchData(): Observable<any> {
    return this.http.get('http://localhost:8089/api/protected', {
      headers: this.getAuthHeaders()
    });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/onepage']);
  }

  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  private isTokenExpired(expiration: number): boolean {
    return expiration < Math.floor(Date.now() / 1000);
  }

  public getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    if (token && this.isTokenExpired(this.decodeToken(token).exp)) {
      console.warn("⚠️ Token expiré ! Vous devez vous reconnecter.");
      alert("⚠️ Votre session a expiré. Veuillez vous reconnecter.");
      return null;
    }
    return token;
  }
}

interface LoginResponse {
  token: string;
}