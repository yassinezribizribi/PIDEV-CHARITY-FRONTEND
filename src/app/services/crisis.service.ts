import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service'; // ✅ Assure-toi que c'est bien importé

export interface Crisis {
    id?: number;
    name: string;
    location: string;
    description: string;
    date?: Date;
    idUser?: number;
    affectedPeople?: number;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    status?: 'ACTIVE' | 'RESOLVED';
}

@Injectable({
  providedIn: 'root'
})
export class CrisisService {
  [x: string]: any;
  private apiUrl = 'http://localhost:8089/api/crises';

  constructor(private http: HttpClient,
    private authService: AuthService // ✅ Injection correcte

  ) {}

  addCrisis(crisisData: Crisis): Observable<Crisis> {
    const userId = this.authService.getUserId(); // Ensure this method returns the logged-in user's ID
    if (!userId) {
      console.error("User ID not found!");
      return throwError(() => new Error("User ID not found"));
    }
  
    crisisData.idUser = userId; // Attach the user ID to the request
  
    return this.http.post<Crisis>(`${this.apiUrl}/add`, crisisData);

  }
  
  getAllCrises(): Observable<Crisis[]> {
    const token = localStorage.getItem('auth_token'); // Récupère le token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Ajoute le token

    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers }).pipe(
      map(crises => crises.map(crisis => ({
          id: crisis.idCrisis, // Map idCrisis -> id
          name: crisis.name,
          description: crisis.description,
          location: crisis.location,
          date: crisis.crisisDate, // Map crisisDate -> date
          idUser: crisis.subscriber?.idUser // Map subscriber.idUser -> idUser
      })))
  );;
  }

  deleteCrisis(id: number): Observable<void> {
    console.log(id)
  const token = localStorage.getItem('auth_token'); // Récupère le token
  if (!token) {
    console.error("Token not found! User might not be logged in.");
    return throwError(() => new Error("Unauthorized: Token is missing"));
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers });
}


  updateCrisis(crisisId: number, crisisData: Crisis): Observable<Crisis> {
    const token = localStorage.getItem('auth_token'); 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); 

    // Envoie la requête PUT pour mettre à jour la crise
    return this.http.put<Crisis>(`${this.apiUrl}/update/${crisisId}`, crisisData, { headers });
  }
  
  
}
