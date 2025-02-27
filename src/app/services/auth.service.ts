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
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   const decodedToken = this.decodeToken(token);
    //   if (this.isTokenExpired(decodedToken.exp)) {
    //     this.logout();
    //   } else {
    //     this.isAuthenticatedSubject.next(true);
    //   }
    // }
    const userToken = localStorage.getItem('auth_token');
    if (userToken) {
      this.isAuthenticatedSubject.next(true);
    }
  }

  // isAuthenticated(): boolean {
  //   return this.isAuthenticatedSubject.value;
  // }
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(response => {
        const token = response.token;
        if (token) {
          console.log('ateeeeef')
          localStorage.setItem('auth_token', token);
          this.isAuthenticatedSubject.next(true);
          
        
          console.log('Token saved:', token);
          // Redirect to 'index' only if the user is authenticated
        //  this.router.navigate(['/index']);
        }
      })
    );
  }
  

  getUserId(): number | null {
    const token = localStorage.getItem('auth_token'); // ✅ Utiliser la bonne clé
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log("Decoded Token:", decodedToken); // ✅ Vérification en console
        return decodedToken.idUser || null;
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
      }
    }
    return null;
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

    // 🔥 Redirection après déconnexion
    this.router.navigate(['/onepage']);
  }

  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  private isTokenExpired(expiration: number): boolean {
    return expiration < Math.floor(Date.now() / 1000);
  }
}

interface LoginResponse {
  token: string;
}
