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
  private tokenKey = 'auth_token';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private router = inject(Router);
  private http = inject(HttpClient);

  constructor() {
    this.logStoredUserInfo();
  }

  /** ✅ Vérifie si un token est présent */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /** ✅ Connexion et stockage du token */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string }>(this.apiUrl, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(response => {
        if (response.token) {
          this.storeToken(response.token);
          console.log("🔐 Token récupéré après connexion :", response.token);
          this.router.navigate(['/index']);
        } else {
          console.error("❌ Erreur : Aucun token reçu !");
        }
      }),
      catchError(error => {
        console.error("❌ Erreur de connexion :", error);
        return throwError(() => error);
      })
    );
  }

  /** ✅ Ajoute le token aux requêtes */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      console.error("⛔ Aucun token JWT trouvé !");
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
  }
  

  /** ✅ Vérifie si le token est expiré */
  public isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken();
      if (!payload || !payload.exp) return true;
      return Date.now() > payload.exp * 1000;
    } catch {
      return true;
    }
  }

  /** ✅ Récupère l'ID utilisateur */
  public getUserId(): number | null {
    const decodedToken = this.decodeToken();
    return decodedToken ? decodedToken.iduser || decodedToken.idUser || null : null;
  }

  /** ✅ Récupère le rôle utilisateur */
  public getUserRole(): string {
    const decodedToken = this.decodeToken();
    return decodedToken?.roles?.[0] || '';
  }

  /** ✅ Récupère le token depuis localStorage */
  getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log("🚀 Token récupéré depuis localStorage :", token);
    return token;
}


  /** ✅ Stocke le token et met à jour l'état */
  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token.trim()); // Évite les espaces accidentels
    console.log("✅ Token stocké :", token);
  }
  
  getUserFullName(): string {
    const token = localStorage.getItem('token');
    if (!token) return 'Inconnu';
  
    const payload = JSON.parse(atob(token.split('.')[1]));
    const firstName = payload.firstName || '';
    const lastName = payload.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }
  
  /** ✅ Décode le token JWT */
  public decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  /** ✅ Debug : Affiche les infos de l'utilisateur */
  private logStoredUserInfo(): void {
    console.log("🔑 Token actuel :", this.getToken());
    console.log("👤 ID utilisateur :", this.getUserId());
    console.log("🎭 Rôle utilisateur :", this.getUserRole());
  }
}
