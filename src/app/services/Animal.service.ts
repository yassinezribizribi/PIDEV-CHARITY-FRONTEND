import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export class Animal {
  idAnimal?: number;
  name!: string;
  animalSpecies!: string;
  race!: string;
  medicalHistory!: string;
  isAdopted!: boolean;
  subscriberId?: number;
}

export interface User {
  idUser: number;          // The ID of the user (mapped from 'idUser' in the backend)
  firstName: string;       // The first name of the user
  lastName: string;        // The last name of the user
  email: string;           // The email of the user
  password?: string;       // The password (optional, since it might not be needed in some cases)
  telephone?: string;      // The telephone (optional)
  isBanned?: boolean;      // Whether the user is banned (optional)
  banreason?: string;      // The reason for banning (optional)
  job?: string;            // The job of the user (optional)
}


@Injectable({
  providedIn: 'root',
})
export class AnimalService {
  private apiUrl = 'http://localhost:8089/api/animals';
  private apiUrlUser = 'http://localhost:8089/api/users';


  constructor(private http: HttpClient) {}

  getAllAnimals(): Observable<Animal[]> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Animal[]>(`${this.apiUrl}/getAllAnimals`, { headers });
  }

  getAnimalById(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/getAnimalById/${id}`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrlUser}/getUserById/${id}`);
  }

  addAnimal(animal: Animal,iduser:number): Observable<Animal> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Animal>(`${this.apiUrl}/add/${iduser}`, animal , { headers });
  }

  updateAnimal(id: number, animal: Animal): Observable<Animal> {
    return this.http.put<Animal>(`${this.apiUrl}/updateAnimal/${id}`, animal);
  }

  deleteAnimal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteAnimal/${id}`);
  }

  getAnimalsByUserId(userId: number): Observable<Animal[]> {
    return this.http.get<Animal[]>(
      `${this.apiUrl}/getAnimalsByUserId/${userId}`
    );
  }

  getNonAdoptedAnimals(): Observable<Animal[]> {
    console.log('Requête vers:', `${this.apiUrl}/non-adopted`);
    return this.http.get<Animal[]>(`${this.apiUrl}/non-adopted`);
  }
}
