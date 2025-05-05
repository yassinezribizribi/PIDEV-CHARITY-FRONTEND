import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscriber, switchMap } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router'; 
import {Applicant } from '../models/job-application.model';
import { User } from '../models/user.model';

import { Association,AssociationStatus } from '../interfaces/association.interface';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8089/api/auth/signin';
  private registerUrl = 'http://localhost:8089/api/auth/signup';
  private associationCheckUrl = 'http://localhost:8089/api/associations';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private router = inject(Router);
  private postLogoutRedirect: string | null = null;
  private tokenExpirationWarningTime = 300000;

  constructor(private http: HttpClient) {
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.exp && this.isTokenExpired(decodedToken.exp)) {
        this.logout();
      } else {
        this.isAuthenticatedSubject.next(true);  // Set authenticated to true if the token is valid
      }
    }
  }

  checkAssociation(): Observable<Association | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<Association>(this.associationCheckUrl, { headers }).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getUserInfo(): { email: string | null; idUser: number | null; role?: string } {
    const token = localStorage.getItem('auth_token');
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

  getCurrentUser(): any {
    return this.getUserInfo(); // Ou utilisez une autre méthode qui récupère les informations de l'utilisateur
  }
  
 // New method for role checking
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

  // auth.service.ts
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          this.isAuthenticatedSubject.next(true);
  
          const userRoles = response.roles || [];
  
          if (userRoles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/app-admin-dashboard']);
          } else if (userRoles.includes('ROLE_ASSOCIATION_MEMBER')) {
            this.checkAssociation().subscribe(association => {
              if (association) {
                this.router.navigate(['/association/account']); // Redirect to association account if association exists
              } else {
                this.router.navigate(['/register-association']); // Redirect to register association if no association exists
              }
            });
          } else {
            this.router.navigate(['/index']); // Redirect to default page for other roles
          }
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
        return decodedToken.idUser || decodedToken.userId || decodedToken.sub || null;
      } catch (error) {
        return null;
      }
    }
    return null;
  }
  // In AuthService
  getUserById(userId: number): Observable<Applicant> {
    const headers = this.getAuthHeaders();
    return this.http.get<Applicant>(`http://localhost:8089/api/auth/user/${userId}`, { headers });
  }
  getToken(): string {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return '';
      }

      // Validate token format
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

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }
  getUserName(): string | null {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.fullName || null;
  }
  
  getUserByEmail(email: string): Observable<Applicant> {
    const headers = this.getAuthHeaders();
    return this.http.get<Applicant>(
      `http://localhost:8089/api/auth/user/email/${email}`, 
      { headers }
    );}
  
  fetchData(): Observable<any> {
    return this.http.get('http://localhost:8089/api/protected', {
      headers: this.getAuthHeaders()
    });
  }

  // Logout method
  logout(): void {
    localStorage.clear(); // Clear entire storage for safety
    sessionStorage.clear();
    
    // Reset authentication state
    this.isAuthenticatedSubject.next(false);
    
    // Redirect to login page after logout
    this.router.navigate(['/login'], { 
      replaceUrl: true,
      queryParams: { returnUrl: this.postLogoutRedirect },
      state: { clearHistory: true }
    }).then(() => {
      window.location.reload(); // Force full page reload
    });
  }


  private isTokenExpired(expiration: number): boolean {
    return expiration < Math.floor(Date.now() / 1000); // Compare with current time in seconds
  }

  setToken(token: string): void {
    if (!token) {
      console.error('Attempted to set empty token');
      return;
    }

    // Validate token format
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format');
        return;
      }

      // Clean and store the token
      const cleanToken = token.trim();
      localStorage.setItem('auth_token', cleanToken);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
    this.isAuthenticatedSubject.next(false);
  }

  decodeToken(token: string): { userId: number } | null {
    try {
      const decodedToken: any = jwtDecode(token);
      return { userId: decodedToken.idUser || decodedToken.userId || decodedToken.sub || 0 };
    } catch (error) {
      return null;
    }
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`http://localhost:8089/api/auth/users`, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${user.idUser}`, user, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getProfileImage(userId: number): Observable<string | null> {
    const token = this.getToken();
    return this.getUserById(userId).pipe(
      switchMap(user => {
        const imagePath = (user as any).profileImage;
        if (!imagePath) {
          return of(null);
        }
        
        // Extract filename from the path
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
}
// Update the LoginResponse interface to match actual API response
interface LoginResponse {
  token: string;
  type: string;
  idUser: number;
  roles: string[];  // 👈 Roles are at root level
  user?: any;       // 👈 Keep this only if you actually receive user data
}
