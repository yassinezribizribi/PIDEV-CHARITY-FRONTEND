// modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IModalConfig {
  component: string;
  data?: {
    title?: string;
    content?: string;
    size?: 'sm' | 'md' | 'lg';
    [key: string]: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<IModalConfig | null>(null);
  modal$ = this.modalSubject.asObservable();

  open(component: string, data?: any) {
    this.modalSubject.next({ component, data });
  }

  close() {
    this.modalSubject.next(null);
  }
}