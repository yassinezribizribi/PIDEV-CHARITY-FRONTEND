import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdminSubject.asObservable();

  constructor(private router: Router) {
    // Check if admin is logged in
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    this.isAdminSubject.next(isAdmin);
  }

  isAdmin(): boolean {
    return this.isAdminSubject.value;
  }

  login(username: string, password: string): boolean {
    // For testing purposes - replace with real authentication
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('is_admin', 'true');
      this.isAdminSubject.next(true);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('is_admin');
    this.isAdminSubject.next(false);
    this.router.navigate(['/']);
  }
} 