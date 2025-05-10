import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdminSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Récupère l'état admin depuis localStorage ou par jeton
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    this.isAdminSubject.next(isAdmin);
  }

  private apiUrl = 'http://localhost:8089/api/auth'; 

  // Méthode de connexion avec gestion du rôle admin après validation
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/login`, { email, password }).pipe(
      map(response => {
        if (response?.token) {
          // Stocke le token et définit is_admin en fonction des données reçues
          localStorage.setItem('jwt_token', response.token);
          localStorage.setItem('is_admin', response.isAdmin ? 'true' : 'false');
          this.isAdminSubject.next(response.isAdmin);
        }
        return response;
      }),
      catchError(error => {
        console.error('Login error', error);
        return of(null);  // Ou autre logique pour gérer l'erreur
      })
    );
  }

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('is_admin');
    this.isAdminSubject.next(false);
    this.router.navigate(['/admin/login']);
  }

  isAdmin(): boolean {
    // Vérifie la présence et la validité du jeton et du rôle
    return localStorage.getItem('is_admin') === 'true';
  }
}
