import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface Training {
  idTraining: number;
  trainingName: string;
  description: string;
  duration: number;
  capacity: number;
  level: string;
  type: string;
  sessionDate: string;
  subscribers?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  private apiUrl = 'http://localhost:8089/api/trainings';

  constructor(private http: HttpClient) {}

  getAllTrainings(): Observable<Training[]> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Training[]>(this.apiUrl,{headers});
  }

  getTrainingById(id: number): Observable<Training> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Training>(`${this.apiUrl}/${id}`,{headers});
  }

  addTraining(training: Training): Observable<Training> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Training>(`${this.apiUrl}/add`, training,{headers});
  }

  updateTraining(id: number, training: Training): Observable<Training> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Training>(`${this.apiUrl}/${id}`, training,{headers});
  }

  deleteTraining(id: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${id}`,{headers});
  }

  getTrainingsBySubscriber(subscriberId: number): Observable<Training[]> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Training[]>(`${this.apiUrl}/subscriber/${subscriberId}`,{headers});
  }

  addSubscriberToTraining(trainingId: number, userId: number): Observable<Training> {
      const token = localStorage.getItem('auth_token');
        if (!token) {
          return throwError(() => new Error('User is not authenticated.'));
        }
      
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
    return this.http.post<Training>(`${this.apiUrl}/${trainingId}/add-subscriber/${userId}`, {headers});
  }
}