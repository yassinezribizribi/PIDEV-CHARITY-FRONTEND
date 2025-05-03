import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CustomModalConfig {
  component: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CustomModalHandlerService {
  private modalSubject = new BehaviorSubject<CustomModalConfig | null>(null);
  modal$ = this.modalSubject.asObservable();

  open(component: string, data?: any) {
    this.modalSubject.next({ component, data });
  }

  close() {
    this.modalSubject.next(null);
  }
}