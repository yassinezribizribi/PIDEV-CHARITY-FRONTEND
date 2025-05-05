import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastNotificationService {
  showSuccess(message: string): void {
    // You can implement your preferred toast notification library here
    // For now, we'll use the browser's alert as a fallback
    alert(message);
  }

  showError(message: string): void {
    // You can implement your preferred toast notification library here
    // For now, we'll use the browser's alert as a fallback
    alert(message);
  }
} 