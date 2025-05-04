// modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalAction {
  text: string;
  class: string;
  handler: () => void;
}

export interface ModalData {
  title?: string;
  content?: string;
  size?: 'sm' | 'md' | 'lg';
  actions?: ModalAction[];
}

export interface IModalConfig {
  component: string;
  data?: ModalData;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<IModalConfig | null>(null);
  modal$ = this.modalSubject.asObservable();

  open(component: string, data?: ModalData) {
    this.modalSubject.next({ component, data });
  }

  close() {
    this.modalSubject.next(null);
  }

  isModalOpen(component: string): boolean {
    const currentModal = this.modalSubject.getValue();
    return currentModal?.component === component;
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    // Implement toast notification logic
    console.log(`Toast (${type}): ${message}`);
  }
}