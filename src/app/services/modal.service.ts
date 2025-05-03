import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalConfig {
  component: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalConfig | null>(null);
  modal$ = this.modalSubject.asObservable();

  open(component: string, data?: any) {
    this.modalSubject.next({ component, data });
  }

  close() {
    this.modalSubject.next(null);
  }
}