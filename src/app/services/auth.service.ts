import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router'; 
import { jwtDecode } from 'jwt-decode';

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
      const decodedToken = jwtDecode(token);
if (decodedToken.exp && this.isTokenExpired(decodedToken.exp)) {  
  this.logout();
}
 else {
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
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          this.isAuthenticatedSubject.next(true);
          console.log('Token saved:', response.token);
          
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            console.log('User data saved:', response.user);
          }

          this.router.navigate(['/index']);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(this.registerUrl, userData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  getUserId(): number | null {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);
        return decodedToken.idUser || decodedToken.userId || decodedToken.sub || null;
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
      }
    }
    return null;
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (!token) return new HttpHeaders(); // Évite d'envoyer un header vide

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  fetchData(): Observable<any> {
    return this.http.get('http://localhost:8089/api/protected', {
      headers: this.getAuthHeaders()
    });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user'); // Supprime aussi les données utilisateur
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/onepage']);
  }

  private isTokenExpired(expiration: number): boolean {
    return expiration < Math.floor(Date.now() / 1000);
  }
}

interface LoginResponse {
  token: string;
  user: any;
}
