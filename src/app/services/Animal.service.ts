import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Animal {
  idAnimal?: number;
  name: string;
  animalSpecies: string;
  race: string;
  medicalHistory: string;
  isAdopted: boolean;
  subscriberId?: number; 
}

@Injectable({
  providedIn: 'root',
})
export class AnimalService {
  private apiUrl = 'http://localhost:8089/api/animals';

  constructor(private http: HttpClient) {}

  getAllAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl}/getAllAnimals`);
  }

  getAnimalById(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/getAnimalById/${id}`);
  }

  addAnimal(animal: Animal): Observable<Animal> {
    return this.http.post<Animal>(`${this.apiUrl}/add`, animal);
  }

  updateAnimal(id: number, animal: Animal): Observable<Animal> {
    return this.http.put<Animal>(`${this.apiUrl}/updateAnimal/${id}`, animal);
  }

  deleteAnimal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteAnimal/${id}`);
  }

  getAnimalsByUserId(userId: number): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl}/getAnimalsByUserId/${userId}`);
  }
}