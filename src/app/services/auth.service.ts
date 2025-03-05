import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router'; 
import { Association,AssociationStatus } from '../interfaces/association.interface';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8089/api/auth/signin';
  private registerUrl = 'http://localhost:8089/api/auth/signup';
  private associationCheckUrl = 'http://localhost:8089/api/associations'; // Update this URL to match your backend endpoint

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private router = inject(Router);
  private postLogoutRedirect: string | null = null;


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
      console.error("No token found");
      return of(null); // Return null if no token is found
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<Association>(this.associationCheckUrl, { headers }).pipe(
      catchError(() => {
        console.error("Error fetching associations");
        return of(null); // Return null if the request fails or no association is found
      })
    );
  }
  


  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
  // AuthService: Method to retrieve user info from token
  getUserInfo(): { email: string | null; idUser: number | null } {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);  // Log the decoded token for debugging
        return {
          email: decodedToken.sub || null, // 'sub' usually contains the user's email
          idUser: decodedToken.idUser || decodedToken.userId || null, // Extract idUser or fallback to sub or userId
        };
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    return { email: null, idUser: null }; // Return null if token is invalid or missing
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
        console.log("Decoded Token:", decodedToken);
        return decodedToken.idUser || decodedToken.userId || decodedToken.sub || null;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    return null;
  }
  getToken(): string {
    const token = localStorage.getItem('auth_token'); // Use the correct key
    console.log('Token from localStorage:', token); // Debugging: Log the token
    return token || ''; // Return the token or an empty string if it doesn't exist
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken(); // Use the getToken() method
    console.log('Token in getAuthHeaders:', token); // Debugging: Log the token
    if (!token) return new HttpHeaders(); // Avoid sending an empty header
  
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  
  
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
}
// Update the LoginResponse interface to match actual API response
interface LoginResponse {
  token: string;
  type: string;
  idUser: number;
  roles: string[];  // 👈 Roles are at root level
  user?: any;       // 👈 Keep this only if you actually receive user data
}
