import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Applicant } from '../models/job-application.model';
import { User } from '../models/user.model';
import { Association } from '../interfaces/association.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8089/api/auth/signin';
  private registerUrl = 'http://localhost:8089/api/auth/signup';
  private associationCheckUrl = 'http://localhost:8089/api/associations';
  private tokenKey = 'auth_token';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private router = inject(Router);
  private http = inject(HttpClient);
  private postLogoutRedirect: string | null = null;
  private tokenExpirationWarningTime = 300000;

  constructor() {
    this.checkAuthentication();
    this.logStoredUserInfo();
  }

  /** ✅ Vérifie si un token est présent */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /** ✅ Vérifie l'authentification et la validité du token */
  private checkAuthentication(): void {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.exp && this.isTokenExpired(decodedToken.exp)) {
        this.logout();
      } else {
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  /** ✅ Vérifie si l'utilisateur est une association */
  checkAssociation(): Observable<Association | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }
  
    return this.http.get<Association>(this.associationCheckUrl, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(() => of(null))
    );
  }

  /** ✅ Vérifie si l'utilisateur est authentifié */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /** ✅ Récupère les informations de l'utilisateur depuis le token */
  getUserInfo(): { email: string | null; idUser: number | null; role?: string } {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return {
          email: decodedToken.sub || null,
          idUser: decodedToken.idUser || null,
          role: decodedToken.role || ''
        };
      } catch (error) {
        return { email: null, idUser: null };
      }
    }
    return { email: null, idUser: null };
  }

  /** ✅ Récupère l'utilisateur courant */
  getCurrentUser(): any {
    return this.getUserInfo();
  }

  /** ✅ Récupère les rôles de l'utilisateur */
  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    
    try {
      const decoded = jwtDecode(token) as any;
      return decoded.roles || [];
    } catch {
      return [];
    }
  }

  /** ✅ Connexion et redirection */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      tap(response => {
        if (response.token) {
          this.storeToken(response.token);
          this.isAuthenticatedSubject.next(true);

          const userRoles = response.roles || [];

          if (userRoles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/app-admin-dashboard']);
          } else if (userRoles.includes('ROLE_ASSOCIATION_MEMBER')) {
            this.checkAssociation().subscribe(association => {
              if (association) {
                this.router.navigate(['/association/account']);
              } else {
                this.router.navigate(['/register-association']);
              }
            });
          } else {
            this.router.navigate(['/index']);
          }
        }
      }),
      catchError(error => {
        console.error("❌ Erreur de connexion :", error);
        return throwError(() => error);
      })
    );
  }

  /** ✅ Inscription */
  register(userData: any): Observable<any> {
    return this.http.post<any>(this.registerUrl, userData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  /** ✅ Récupère l'ID de l'utilisateur */
  getUserId(): number | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.idUser || decodedToken.userId || decodedToken.sub || null;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  /** ✅ Récupère un utilisateur par son ID */
  getUserById(userId: number): Observable<Applicant> {
    return this.http.get<Applicant>(
      `http://localhost:8089/api/auth/user/${userId}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  /** ✅ Récupère le token */
  getToken(): string {
    try {
      const token = localStorage.getItem(this.tokenKey);
      if (!token) {
        return '';
      }

      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format in storage');
        this.removeToken();
        return '';
      }

      return token.trim();
    } catch (error) {
      console.error('Error getting token:', error);
      return '';
    }
  }

  /** ✅ Récupère les headers d'authentification */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }

  /** ✅ Récupère le nom complet de l'utilisateur */
  getUserFullName(): string {
    const token = this.getToken();
    if (!token) return 'Inconnu';
  
    try {
      const payload = jwtDecode(token) as any;
      const firstName = payload.firstName || '';
      const lastName = payload.lastName || '';
      return `${firstName} ${lastName}`.trim();
    } catch {
      return 'Inconnu';
    }
  }

  /** ✅ Récupère un utilisateur par son email */
  getUserByEmail(email: string): Observable<Applicant> {
    return this.http.get<Applicant>(
      `http://localhost:8089/api/auth/user/email/${email}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  /** ✅ Déconnexion */
  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.isAuthenticatedSubject.next(false);
    
    this.router.navigate(['/login'], { 
      replaceUrl: true,
      queryParams: { returnUrl: this.postLogoutRedirect },
      state: { clearHistory: true }
    }).then(() => {
      window.location.reload();
    });
  }

  /** ✅ Vérifie si le token est expiré */
  private isTokenExpired(expiration: number): boolean {
    return expiration < Math.floor(Date.now() / 1000);
  }

  /** ✅ Stocke le token */
  storeToken(token: string): void {
    if (!token) {
      console.error('Attempted to set empty token');
      return;
    }

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format');
        return;
      }

      const cleanToken = token.trim();
      localStorage.setItem(this.tokenKey, cleanToken);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  /** ✅ Supprime le token */
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
  }

  /** ✅ Récupère l'image de profil */
  getProfileImage(userId: number): Observable<string | null> {
    const token = this.getToken();
    return this.getUserById(userId).pipe(
      switchMap(user => {
        const imagePath = (user as any).profileImage;
        if (!imagePath) {
          return of(null);
        }
        
        const filename = imagePath.split('/').pop();
        if (!filename) {
          return of(null);
        }

        return this.http.get(`http://localhost:8089/api/auth/profile-image/${filename}`, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${token}`
          }),
          responseType: 'blob'
        }).pipe(
          map(blob => URL.createObjectURL(blob)),
          catchError(error => {
            console.error('Error loading profile image:', error);
            return of(null);
          })
        );
      }),
      catchError(error => {
        console.error('Error getting user:', error);
        return of(null);
      })
    );
  }

  /** ✅ Debug : Affiche les infos de l'utilisateur */
  private logStoredUserInfo(): void {
    console.log("🔑 Token actuel :", this.getToken());
    console.log("👤 ID utilisateur :", this.getUserId());
    console.log("🎭 Rôle utilisateur :", this.getUserRoles());
  }

  /** ✅ Récupère tous les utilisateurs */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`http://localhost:8089/api/auth/users`, {
      headers: this.getAuthHeaders()
    });
  }

  /** ✅ Met à jour un utilisateur */
  updateUser(user: User): Observable<any> {
    return this.http.put(
      `http://localhost:8089/api/auth/update/${user.idUser}`, 
      user,
      { headers: this.getAuthHeaders() }
    );
  }

  /** ✅ Supprime un utilisateur */
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(
      `http://localhost:8089/api/auth/delete/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /** ✅ Décode le token JWT */
  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /** ✅ Récupère le rôle de l'utilisateur */
  getUserRole(): string {
    const roles = this.getUserRoles();
    return roles.length > 0 ? roles[0] : '';
  }

  /** ✅ Définit le token */
  setToken(token: string): void {
    this.storeToken(token);
  }
}

interface LoginResponse {
  token: string;
  type: string;
  idUser: number;
  roles: string[];
  user?: any;
}