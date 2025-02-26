// event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Event {
  idEvent: number; // Correspond à idEvent dans l’entité Java
  title: string;
  description: string;
  dateTime: string; // Remplace "date" par "dateTime" comme dans l’entité
  location: string;
  typeEvent: string; // Enum côté Java, mais reçu comme string en JSON
  reservationDate: string; // Reçu comme string depuis le JSON
  associationId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = 'http://localhost:8089/api/events'; // Port 8089 comme dans ton erreur

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/getAllEvents`);
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/getEventById/${id}`);
  }
  addEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/add`, event);
  }

  // Mettre à jour un événement
  updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/updateEvent/${id}`, event);
  }
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteEvent/${id}`);
  }
  //registerParticipant(eventId: number, participant: any): Observable<any> {
  //  return this.http.post<any>(`${this.apiUrl}/registerParticipant/${eventId}`, participant);
 // }
  
}