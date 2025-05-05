import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private theme = new BehaviorSubject<string>('light');
  theme$ = this.theme.asObservable();

  constructor() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  }

  setTheme(theme: string) {
    this.theme.next(theme);
    localStorage.setItem('theme', theme);
    
    // Apply theme to body
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }

  getTheme(): string {
    return this.theme.value;
  }
} 