import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface CrisisAssignmentResponse {
  message: string;
  assignedAssociationAddress: string;
}

export enum CrisisStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export interface CrisisPage {
  content: Crisis[];
  totalPages: number;
  totalElements: number;
  number: number; // numéro de page actuelle
  size: number;
}

export interface Crisis {
  idCrisis?: number;
  categorie: string;
  location: string;
  updates: string;
  description: string;
  crisisDate: string;
  severity: string;
  status: CrisisStatus;
  latitude?: number;
  longitude?: number;
  idUser?: number;
  missions?: any[];
  image?: string | File;
  imageUrl?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CrisisService {
  private apiUrl = 'http://localhost:8089/api/crises';
  private geocodingApiUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ✅ Ajouter une crise avec image et géocodage
  addCrisis(crisisData: any, image: File | null): Observable<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) return throwError(() => new Error('Token not found'));

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('crisisDTO', new Blob([JSON.stringify(crisisData)], { type: 'application/json' }));
    if (image) {
      formData.append('file', image, image.name);
    }

    return this.http.post<any>(`${this.apiUrl}/add`, formData, { headers }).pipe(
      catchError((error) => {
        console.error('Error adding crisis:', error);
        return throwError(() => new Error('Failed to add crisis'));
      })
    );
  }

  // ✅ Géocodage OpenStreetMap
  getCoordinates(location: string): Observable<{ lat: number; lon: number }> {
    const url = `${this.geocodingApiUrl}?q=${encodeURIComponent(location)}&format=json&limit=1`;
    return this.http.get<any[]>(url).pipe(
      map((results) => {
        if (results.length === 0) throw new Error('No coordinates found');
        return {
          lat: parseFloat(results[0].lat),
          lon: parseFloat(results[0].lon)
        };
      }),
      catchError((error) => {
        console.error('Geocoding failed:', error);
        return throwError(() => new Error('Failed to geocode location'));
      })
    );
  }

  // ✅ Récupérer toutes les crises
  getAllCrises(page: number = 0, size: number = 5): Observable<CrisisPage> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this.http.get<CrisisPage>(`${this.apiUrl}/all?page=${page}&size=${size}`, { headers }).pipe(
      map((response: CrisisPage) => {
        // Transforme les crises pour ajouter imageUrl
        const transformedContent = response.content.map((crisis) => ({
          ...crisis,
          imageUrl: crisis.image ? `http://localhost:8089/images/${crisis.image}` : null
        }));
        return { ...response, content: transformedContent };
      }),
      catchError((error) => {
        console.error('Error fetching paginated crises:', error);
        return throwError(() => new Error('Failed to fetch paginated crises'));
      })
    );
  }

  // ✅ Supprimer une crise
  deleteCrisis(id: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error deleting crisis:', error);
        return throwError(() => new Error('Failed to delete crisis'));
      })
    );
  }

  // ✅ Mettre à jour une crise
  updateCrisis(crisisId: number, crisisData: Crisis): Observable<Crisis> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<Crisis>(`${this.apiUrl}/update/${crisisId}`, crisisData, { headers }).pipe(
      catchError((error) => {
        console.error('Error updating crisis:', error);
        return throwError(() => new Error('Failed to update crisis'));
      })
    );
  }

  // ✅ Récupérer les catégories
  getCategories(): Observable<Crisis> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Crisis>(`${this.apiUrl}/categories`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching categories:', error);
        return throwError(() => new Error('Failed to fetch categories'));
      })
    );
  }

  // ✅ Mettre à jour le statut d’une crise
  updateCrisisStatus(id: number, status: CrisisStatus): Observable<Crisis> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.patch<Crisis>(
      `${this.apiUrl}/${id}/status?status=${status}`, {}, { headers }
    );
  }

  // ✅ Assigner une crise à l’association la plus proche
  assignCrisisToNearestAssociation(crisisId: number): Observable<CrisisAssignmentResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<CrisisAssignmentResponse>(
      `${this.apiUrl}/${crisisId}/assign-association`,
      {}, { headers }
    ).pipe(
      catchError((error) => {
        console.error('Error assigning crisis:', error);
        return throwError(() => new Error('Failed to assign crisis to an association'));
      })
    );
  }

  // ✅ Récupérer les zones saturées
  getSaturatedZones(threshold: number = 3): Observable<string[]> {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('Token not found');
      return throwError(() => new Error('Token not found'));
    }
    console.log('Using token:', token);  // Log token for debugging
    
  
    // Set the token in the Authorization header
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    // Make the HTTP GET request with the headers
    return this.http.get<string[]>(`http://localhost:8089/api/crises/saturated-zones?threshold=${threshold}`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error fetching saturated zones:', error);
          return throwError(() => new Error('Failed to fetch saturated zones'));
        })
      );
  }
  
  
  
  
}
