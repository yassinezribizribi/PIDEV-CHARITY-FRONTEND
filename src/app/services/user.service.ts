import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getUserProfileImage(filename: string): Observable<Blob> {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Accept', 'image/jpeg, image/png, image/gif');
    
    return this.http.get(`${this.apiUrl}/protected/files/${filename}`, { 
      headers: headers,
      responseType: 'blob' 
    }).pipe(
      catchError(error => {
        // Return a default image blob if the profile image fails to load
        return this.getDefaultProfileImage();
      })
    );
  }

  private getDefaultProfileImage(): Observable<Blob> {
    // Fetch the default profile image from assets
    return this.http.get('assets/images/default-logo.jpg', {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        // Return an empty blob as last resort
        return of(new Blob());
      })
    );
  }
} 