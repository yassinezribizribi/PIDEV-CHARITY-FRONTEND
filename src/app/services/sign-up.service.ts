import { Component, Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';  // Import Router


@Injectable({
  providedIn: 'root'
})


export class SignupService {
  private apiUrl = 'http://localhost:8089/api/auth/signup';
 // private http = inject(HttpClient);
 constructor(private http: HttpClient, private router: Router) {}

  register(user: { email: string; password: string; role: string; firstName: string; lastName: string; telephone: string; job: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, user, {headers});
}

// Method to handle redirection based on role
handleRedirectBasedOnRole(role: string) {
  if (role === 'ASSOCIATION_MEMBER') {
    this.router.navigate(['/login']); // Redirect to the association registration page
  }
}

  
}
