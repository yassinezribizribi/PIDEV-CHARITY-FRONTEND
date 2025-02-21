import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AidCase } from '../interfaces/association.interface';

@Injectable({
  providedIn: 'root'
})
export class AidCaseService {
  private aidCases = new BehaviorSubject<AidCase[]>([]);

  constructor() {
    // Load initial data from localStorage
    const stored = localStorage.getItem('aid_cases');
    if (stored) {
      this.aidCases.next(JSON.parse(stored));
    }
  }

  getAidCases(): Observable<AidCase[]> {
    return this.aidCases.asObservable();
  }

  createAidCase(data: Partial<AidCase>): Promise<AidCase> {
    const newCase: AidCase = {
      id: 'aid-' + Date.now(),
      ...data,
      status: 'active',
      startDate: new Date(),
      donations: [],
      updates: [],
      images: [],
      documents: []
    } as AidCase;

    const current = this.aidCases.value;
    current.push(newCase);
    this.aidCases.next(current);
    this.saveToStorage();

    return Promise.resolve(newCase);
  }

  updateAidCase(id: string, data: Partial<AidCase>): Promise<AidCase> {
    const current = this.aidCases.value;
    const index = current.findIndex(c => c.id === id);
    
    if (index === -1) {
      return Promise.reject('Aid case not found');
    }

    current[index] = { ...current[index], ...data };
    this.aidCases.next(current);
    this.saveToStorage();

    return Promise.resolve(current[index]);
  }

  private saveToStorage() {
    localStorage.setItem('aid_cases', JSON.stringify(this.aidCases.value));
  }
} 