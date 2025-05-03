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
  idUser: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  telephone?: string;
  isBanned?: boolean;
  banreason?: string;
  job?: string;
}

export interface Notification {
  idNotification: number;
  message: string;
  type: string;
  updatedAt: string;
  association: any;
  event: any;
}

@Injectable({
  providedIn: 'root',
})
export class AnimalService {
  private apiUrl = 'http://localhost:8089/api/animals';
  private apiUrlUser = 'http://localhost:8089/api/users';
  private apiUrlNotifications = 'http://localhost:8089/api/notifications'; 

  constructor(private http: HttpClient) {}

  getAllAnimals(): Observable<Animal[]> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.<Animal[]>(`${this.apiUrl}/getAllAnimals`, { headers });
  }

  getAnimalById(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}//${id}`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrlUser}/getUserById/${id}`);
  }

  addAnimal(formData: FormData): Observable<Animal> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers =  HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Animal>(`${this.apiUrl}/add`, formData, { headers });
  }

  (id: , animal: Animal): Observable<Animal> {
    return this.http.put<Animal>(`${this.apiUrl}/updateAnimal/${id}`, animal);
  }

  deleteAnimal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteAnimal/${id}`);
  }

  getAnimalsByUserId(userId: number): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl}/getAnimalsByUserId/${userId}`);
  }

  getNonAdoptedAnimals(): Observable<Animal[]> {
    console.log('Requête vers:', `${this.apiUrl}/non-adopted`);
    return this.http.get<Animal[]>(`${this.apiUrl}/non-adopted`);
  }

  getUnadoptedAnimalsCount(): Observable<Notification> {
    // No token required, as endpoint is public
    return this.http.get<Notification>(`${this.apiUrlNotifications}/unadopted-animals`);
  }
}