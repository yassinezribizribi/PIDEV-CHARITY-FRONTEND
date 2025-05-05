import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
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
}

// Add interface for response types
interface CrisisResponse {
  data?: any[];
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

    // First get coordinates for the location
    return this.getCoordinates(crisisData.location).pipe(
      switchMap(coordinates => {
        if (!coordinates || !coordinates.lat || !coordinates.lon) {
          return throwError(() => new Error('Could not get coordinates for the location'));
        }

        // Format the crisis data with coordinates
        const crisisWithCoordinates = {
          ...crisisData,
          latitude: coordinates.lat,
          longitude: coordinates.lon,
          // Ensure location is in a format the backend expects
          location: this.formatLocationForBackend(crisisData.location)
        };

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const formData = new FormData();
        
        // Convert crisis data to string and ensure proper formatting
        const crisisDataString = JSON.stringify(crisisWithCoordinates, null, 2);
        formData.append('crisisDTO', new Blob([crisisDataString], { type: 'application/json' }));
        
        if (image) {
          formData.append('file', image, image.name);
        }

        // Log the data being sent for debugging
        console.log('Sending crisis data:', crisisWithCoordinates);

        return this.http.post<any>(`${this.apiUrl}/add`, formData, {
          headers,
          responseType: 'text' as 'json'
        });
      }),
      catchError((error) => {
        console.error('Error adding crisis:', error);
        if (error.message === 'Failed to geocode location') {
          return throwError(() => new Error('Could not find the exact location. Please try a different address format.'));
        }
        return throwError(() => new Error('Failed to add crisis'));
      })
    );
  }

  private formatLocationForBackend(location: string): string {
    // Format location specifically for backend processing
    let formatted = location
      .replace(/,?\s*Gouvernorat\s*/gi, '')
      .replace(/,?\s*Tunisie\s*/gi, '')
      .replace(/,?\s*Tunis\s*/gi, 'Tunis')
      .replace(/(Tunis)(Tunis)/gi, '$1') // Fix double Tunis
      .trim();

    // Add Tunisia if not present
    if (!formatted.toLowerCase().includes('tunisia')) {
      formatted += ', Tunisia';
    }

    return formatted;
  }

  // ✅ Géocodage OpenStreetMap
  getCoordinates(location: string): Observable<any> {
    // Format the location string for better geocoding results
    const formattedLocation = this.formatLocationForGeocoding(location);
    const url = `${this.geocodingApiUrl}?q=${encodeURIComponent(formattedLocation)}&format=json&limit=1&countrycodes=tn`;
    
    return this.http.get<any[]>(url).pipe(
      map((results) => {
        if (results.length === 0) {
          // Try without country code if first attempt fails
          return this.http.get<any[]>(`${this.geocodingApiUrl}?q=${encodeURIComponent(formattedLocation)}&format=json&limit=1`).pipe(
            map((fallbackResults) => {
              if (fallbackResults.length === 0) {
                throw new Error('No coordinates found');
              }
              return {
                lat: parseFloat(fallbackResults[0].lat),
                lon: parseFloat(fallbackResults[0].lon)
              };
            })
          );
        }
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

  private formatLocationForGeocoding(location: string): string {
    // Remove common suffixes that might confuse the geocoder
    let formatted = location
      .replace(/,?\s*Gouvernorat\s*/gi, ', ')
      .replace(/,?\s*Tunisie\s*/gi, '')
      .replace(/,?\s*Tunis\s*/gi, 'Tunis')
      .replace(/(Tunis)(Tunis)/gi, '$1') // Fix double Tunis
      .trim();

    // Add "Tunisia" at the end if not present
    if (!formatted.toLowerCase().includes('tunisia')) {
      formatted += ', Tunisia';
    }

    return formatted;
  }

 // Mise à jour de la méthode pour récupérer les crises
getAllCrises(): Observable<Crisis[]> {
  const token = localStorage.getItem('auth_token');
  const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${token}`)
    .set('Accept', 'application/json');

  return this.http.get(`${this.apiUrl}/all`, { 
    headers,
    responseType: 'text'
  }).pipe(
    map(response => {
      try {
        // Remove any potential BOM characters and whitespace
        let cleanedResponse = response.trim().replace(/^\uFEFF/, '');
        
        // Find the first complete object
        const startIndex = cleanedResponse.indexOf('{"idCrisis":');
        if (startIndex === -1) {
          throw new Error('Could not find start of crisis object');
        }

        // Find the end of the first object
        let endIndex = startIndex;
        let bracketCount = 0;
        let inString = false;
        let escapeNext = false;

        for (let i = startIndex; i < cleanedResponse.length; i++) {
          const char = cleanedResponse[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            continue;
          }

          if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
          }

          if (!inString) {
            if (char === '{') bracketCount++;
            if (char === '}') {
              bracketCount--;
              if (bracketCount === 0) {
                endIndex = i;
                break;
              }
            }
          }
        }

        // Extract just the first object and wrap it in an array
        const firstObject = cleanedResponse.substring(startIndex, endIndex + 1);
        const validJson = `[${firstObject}]`;

        console.log('Extracted JSON:', validJson);

        // Parse the cleaned JSON
        const crises = JSON.parse(validJson);
        
        if (!Array.isArray(crises)) {
          throw new Error('Parsed result is not an array');
        }

        return crises.map((crisis: any) => ({
          idCrisis: crisis.idCrisis,
          categorie: crisis.categorie,
          location: crisis.location,
          updates: crisis.update,
          description: crisis.description,
          crisisDate: crisis.crisisDate,
          severity: crisis.severity,
          status: crisis.status || CrisisStatus.PENDING,
          latitude: crisis.latitude,
          longitude: crisis.longitude,
          idUser: crisis.subscriber?.idUser,
          image: crisis.image,
          imageUrl: crisis.image ? `http://localhost:8089/images/${crisis.image}` : null
        }));
      } catch (error: any) {
        console.error('Error processing crisis data:', error);
        throw new Error(`Failed to process crisis data: ${error.message}`);
      }
    }),
    catchError((error: any) => {
      console.error('Error in getAllCrises:', error);
      if (error.status === 401) {
        return throwError(() => new Error('Unauthorized: Please log in again'));
      }
      if (error.status === 403) {
        return throwError(() => new Error('Forbidden: You do not have permission to access this resource'));
      }
      if (error.status === 404) {
        return throwError(() => new Error('Not Found: The requested resource does not exist'));
      }
      return throwError(() => new Error(`Failed to fetch crises: ${error.message}`));
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

  // ✅ Mettre à jour une crise (sans image pour l'instant)
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

    return this.http.get<Crisis>(`${this.apiUrl}/categories`).pipe(
      catchError((error) => {
        console.error('Error fetching categories:', error);
        return throwError(() => new Error('Failed to fetch categories'));
      })
    );
  }

  updateCrisisStatus(id: number, status: CrisisStatus): Observable<Crisis> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.patch<Crisis>(`http://localhost:8089/api/crises/${id}/status?status=${status}`, {}, { headers });
  }
  
  
  
  assignCrisisToNearestAssociation(crisisId: number): Observable<CrisisAssignmentResponse> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this.http.put<CrisisAssignmentResponse>(
      `${this.apiUrl}/${crisisId}/assign-association`,
      {},
      { headers }
    ).pipe(
      catchError((error) => {
        console.error('Error assigning crisis:', error);
        return throwError(() => new Error('Failed to assign crisis to an association'));
      })
    );
  }
  
  
}