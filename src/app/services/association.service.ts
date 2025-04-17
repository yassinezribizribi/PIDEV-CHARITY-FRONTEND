import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Association, AssociationStatus } from '../interfaces/association.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AssociationService {
  private apiUrl = 'http://localhost:8089/api/associations';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  private handleError(error: any) {
    if (error.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
    return throwError(() => error);
  }

  // ============== LOGO METHODS ==============
  getAssociationLogo(filename: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/protected/files/${filename}`,
      { 
        headers: this.authService.getAuthHeaders(),
        responseType: 'blob' 
      }
    ).pipe(catchError(this.handleError));
  }

  getPartnerLogo(filename: string): Observable<Blob> {
    return this.getAssociationLogo(filename);
  }

  getPotentialPartnerLogo(filename: string): Observable<Blob> {
    return this.getAssociationLogo(filename);
  }

  // ============== PARTNERSHIP METHODS ==============
  createPartnership(associationId: number, partnerId: number): Observable<Association> {
    return this.http.post<Association>(
      `${this.apiUrl}/${associationId}/partners/${partnerId}`,
      null,
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      tap(() => console.log('Partnership created successfully')),
      catchError(this.handleError)
    );
  }

  getPartners(associationId: number): Observable<Association[]> {
    return this.http.get<Association[]>(
      `${this.apiUrl}/${associationId}/partners`,
      { 
        headers: this.authService.getAuthHeaders(),
        observe: 'response'
      }
    ).pipe(
      map(response => response.body || []),
      catchError(this.handleError)
    );
  }

  getPotentialPartners(associationId: number): Observable<Association[]> {
    return this.http.get<Association[]>(
      `${this.apiUrl}/${associationId}/potential-partners`,
      { headers: this.authService.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  removePartnership(associationId: number, partnerId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${associationId}/partners/${partnerId}`,
      { headers: this.authService.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }
  getAssociationByUserId(userId: string): Observable<Association> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<Association>(`${this.apiUrl}`, { headers });
  }

  getAllAssociations(): Observable<Association[]> {
    return this.http.get<Association[]>(`${this.apiUrl}/list`, { 
      headers: this.authService.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
}


  getAssociationById(id: number): Observable<Association> {
    return this.http.get<Association>(`${this.apiUrl}/${id}`, { 
      headers: this.authService.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  uploadFile(formData: FormData): Observable<{ filePath: string }> {
    return this.http.post<{ filePath: string }>(`${this.apiUrl}/upload`, formData);
  }

  createAssociation(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateAssociation(id: number, association: Association): Observable<Association> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    return this.http.put<Association>(
      `${this.apiUrl}/${id}`,
      association, // Enlever JSON.stringify, Angular gère l'objet automatiquement
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  verifyAssociation(id: number): Observable<Association> {
    return this.http.patch<Association>(
      `${this.apiUrl}/verify/${id}`,
      { status: AssociationStatus.APPROVED },
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  deleteAssociation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.authService.getAuthHeaders() 
    }).pipe(
      tap(() => console.log('Association deleted')),
      catchError(this.handleError)
    );
  }
}
