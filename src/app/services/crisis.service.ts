import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface Crisis {
  idCrisis?: number;
  categorie: string;
  location: string;
  updates: string;
  description: string;
  crisisDate: string;
  severity: string;
  status: string;
  latitude?: number;
  longitude?: number;
  idUser?: number;
  missions?: any[];
  image?: string | File;
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
    if (!token) {
      return throwError(() => new Error('Token not found'));
    }
  
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
  getCoordinates(location: string): Observable<any> {
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
  getAllCrises(): Observable<Crisis[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers }).pipe(
      map((crises) =>
        crises.map((crisis) => ({
          idCrisis: crisis.idCrisis,
          categorie: crisis.category,
          location: crisis.location,
          updates: crisis.update,
          description: crisis.description,
          crisisDate: crisis.crisisDate,
          severity: crisis.severity,
          status: crisis.status,
          latitude: crisis.latitude,
          longitude: crisis.longitude,
          idUser: crisis.subscriber?.idUser,
          image: crisis.image
        }))
      ),
      catchError((error) => {
        console.error('Error fetching crises:', error);
        return throwError(() => new Error('Failed to fetch crises'));
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

  // ✅ Mettre à jour une crise (sans image pour l’instant)
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
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
      catchError((error) => {
        console.error('Error fetching categories:', error);
        return throwError(() => new Error('Failed to fetch categories'));
      })
    );
  }
}
