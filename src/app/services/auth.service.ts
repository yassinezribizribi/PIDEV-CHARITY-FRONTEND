import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8089/api/auth/signin';
  private registerUrl = 'http://localhost:8089/api/auth/signup';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private router = inject(Router);
  private http = inject(HttpClient);

  constructor() {
    this.logStoredUserInfo();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(response => {
        console.log("📥 Réponse API :", response); // 🔥 Debug
        if (response.token) {
          this.storeToken(response.token);
          console.log("🔑 Token stocké :", this.getToken());
          console.log("👤 ID utilisateur :", this.getUserId());
          console.log("🎭 Rôle utilisateur :", this.getUserRole());
          this.router.navigate(['/index']);
        }
      }),
      catchError(error => {
        console.error("❌ Erreur de connexion :", error);
        return throwError(() => error);
      })
    );
  }

  public getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    console.log("🛂 Headers envoyés :", token ? `Bearer ${token}` : 'Pas de token'); // 🔥 Debug
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  public isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken();
      if (!payload || !payload.exp) return true;

      return Date.now() > payload.exp * 1000;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du token:', error);
      return true;
    }
  }

  public getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decodedToken: any = jwtDecode(token);
      console.log("👤 ID utilisateur extrait :", decodedToken);
      return decodedToken.iduser || decodedToken.idUser || null;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'ID utilisateur :", error);
      return null;
    }
  }

  public getUserRole(): string {
    const decodedToken = this.decodeToken();
    return decodedToken && decodedToken.roles && decodedToken.roles.length > 0 ? decodedToken.roles[0] : '';
  }

  public getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.isAuthenticatedSubject.next(true);
  }

  public decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log("📜 Token décodé :", decoded); // 🔥 Debug
      return decoded;
    } catch (error) {
      console.error('❌ Erreur lors du décodage du token:', error);
      return null;
    }
  }

  private logStoredUserInfo(): void {
    console.log("📌 Vérification du stockage local...");
    console.log("🔑 Token actuel :", this.getToken());
    console.log("👤 ID utilisateur :", this.getUserId());
    console.log("🎭 Rôle utilisateur :", this.getUserRole());
  }
}

interface LoginResponse {
  token: string;
}
