import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    return this.http.get<Training[]>(this.apiUrl);
  }

  getTrainingById(id: number): Observable<Training> {
    return this.http.get<Training>(`${this.apiUrl}/${id}`);
  }

  addTraining(training: Training): Observable<Training> {
    return this.http.post<Training>(`${this.apiUrl}/add`, training);
  }

  updateTraining(id: number, training: Training): Observable<Training> {
    return this.http.put<Training>(`${this.apiUrl}/${id}`, training);
  }

  deleteTraining(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTrainingsBySubscriber(subscriberId: number): Observable<Training[]> {
    return this.http.get<Training[]>(`${this.apiUrl}/subscriber/${subscriberId}`);
  }

  addSubscriberToTraining(trainingId: number, userId: number): Observable<Training> {
    return this.http.post<Training>(`${this.apiUrl}/${trainingId}/add-subscriber/${userId}`, {});
  }
}