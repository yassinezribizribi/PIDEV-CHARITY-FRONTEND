import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
export interface DemandeAnimal {
  id?: number;
  user: {
    id: number;
    name?: string;
  };
  animal: {
    id: number;
    name?: string;
    status?: string;
  };
  accepted?: boolean;
  dateDemande?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DemandeAnimalService {

  private baseUrl = 'http://localhost:8089/demandes';

  constructor(private http: HttpClient) {}

  enregistrer(userId: number, animalId: number): Observable<DemandeAnimal> {
       const token = localStorage.getItem('auth_token');
        if (!token) {
          return throwError(() => new Error('User is not authenticated.'));
        }
      
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
    return this.http.post<DemandeAnimal>(`${this.baseUrl}/enregistrer?userId=${userId}&animalId=${animalId}`, {}, {headers});
  }

  accepter(demandeId: number): Observable<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.baseUrl}/accepter/${demandeId}`, {},{headers,responseType: 'text'});
  }

  getAll(): Observable<DemandeAnimal[]> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<DemandeAnimal[]>(this.baseUrl,{headers});
  }
  getAllbyuser(iduser:number): Observable<DemandeAnimal[]> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<DemandeAnimal[]>(this.baseUrl+"/adopted-by-user/"+iduser,{headers});
  }
}
