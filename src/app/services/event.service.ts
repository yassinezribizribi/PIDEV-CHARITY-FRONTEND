import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Event, AssociationEvent } from '../interfaces/association.interface';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events = new BehaviorSubject<Event[]>([]);

  constructor() {
    const stored = localStorage.getItem('association_events');
    if (stored) {
      this.events.next(JSON.parse(stored));
    }
  }

  getEvents(): Observable<Event[]> {
    return this.events.asObservable();
  }

  createEvent(data: Partial<Event>): Promise<Event> {
    const newEvent: Event = {
      id: 'event-' + Date.now(),
      ...data,
      status: 'upcoming',
      attendees: 0,
      images: [],
      registrations: []
    } as Event;

    const current = this.events.value;
    current.push(newEvent);
    this.events.next(current);
    this.saveToStorage();

    return Promise.resolve(newEvent);
  }

  updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    const current = this.events.value;
    const index = current.findIndex(e => e.id === id);
    
    if (index === -1) {
      return Promise.reject('Event not found');
    }

    current[index] = { ...current[index], ...data };
    this.events.next(current);
    this.saveToStorage();

    return Promise.resolve(current[index]);
  }

  private saveToStorage() {
    localStorage.setItem('association_events', JSON.stringify(this.events.value));
  }
} 