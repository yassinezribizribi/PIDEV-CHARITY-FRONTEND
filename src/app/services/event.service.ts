// event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { TypeEvent } from '../models/enums/typeEvent.model';
import { Subscriber } from '../models/subscriber.model';


export interface Event {
  idEvent: number; // Correspond à idEvent dans l’entité Java
  title: string;
  description: string;
  dateTime: string; // Remplace "date" par "dateTime" comme dans l’entité
  location: string;
  typeEvent: TypeEvent | string; // Enum côté Java, mais reçu comme string en JSON
  reservationDate: string; // Reçu comme string depuis le JSON
  associationId?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = 'http://localhost:8089/api/events'; // Port 8089 comme dans ton erreur

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<Event[]> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Event[]>(`${this.apiUrl}/getAllEvents`,{headers});
  }

  getEventById(id: number): Observable<Event> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Event>(`${this.apiUrl}/getEventById/${id}`,{headers});
  }
  
  addEvent(event: Event): Observable<Event> {
    const token = localStorage.getItem('auth_token'); // Retrieve token from local storage
    if (!token) {
      console.error('No token found. User is not authenticated.');
      return throwError(() => new Error('User not authenticated'));
    }
    console.log("associationId insending", event);

  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Include token in Authorization header
    });
  
    return this.http.post<Event>(`${this.apiUrl}/add`, event, { headers });
  }
  affect(event: any,user:any): Observable<Event> {
    const token = localStorage.getItem('auth_token'); // Retrieve token from local storage
    if (!token) {
      console.error('No token found. User is not authenticated.');
      return throwError(() => new Error('User not authenticated'));
    }
    console.log("associationId insending", event);

  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Include token in Authorization header
    });
  
    return this.http.post<Event>(`http://localhost:8089/api/events/affect?eventId=${event}&userId=${user}`, {}, { headers,responseType:"text" as "json"});
  }
  getAssociationId(): Observable<number> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get<number>('/association-id', { headers });
  }
  

  // Mettre à jour un événement
  updateEvent(id: number, event: Event): Observable<Event> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Event>(`${this.apiUrl}/updateEvent/${id}`, event, {headers});
  }

  deleteEvent(id: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/deleteEvent/${id}`);
  }
  //registerParticipant(eventId: number, participant: any): Observable<any> {
  //  return this.http.post<any>(`${this.apiUrl}/registerParticipant/${eventId}`, participant);
 // }
  
  markUserAsInterested(eventId: number, userId: number): Observable<Event> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log(token);
    
    return this.http.post<Event>(`${this.apiUrl}/${eventId}?userId=${userId}`,{}, {headers:headers});
  }

  getEventSubscribers(eventId: number): Observable<Subscriber[]> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Subscriber[]>(`${this.apiUrl}/${eventId}/subscribers`, {headers});
  }

}