import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NotificationBellComponent } from '../../../components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    NotificationBellComponent
  ],
  template: `
    <mat-toolbar class="admin-navbar">
      <div class="flex items-center justify-between w-full">
        <!-- Logo -->
        <div class="flex items-center">
          <mat-icon>menu</mat-icon>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden md:flex space-x-6 items-center">
          <a mat-button routerLink="/dashboard">Dashboard</a>
          <a mat-button routerLink="/users">Manage Users</a>
          <a mat-button routerLink="/settings">Settings</a>
          <app-notification-bell></app-notification-bell>
          <a mat-button (click)="logout()">Logout</a>
        </nav>

        <!-- Mobile Menu Button -->
        <button mat-icon-button (click)="toggleMenu()" class="md:hidden">
          <mat-icon>menu</mat-icon>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div *ngIf="menuOpen" class="mobile-menu">
        <a mat-button routerLink="/dashboard" (click)="toggleMenu()">Dashboard</a>
        <a mat-button routerLink="/users" (click)="toggleMenu()">Manage Users</a>
        <a mat-button routerLink="/settings" (click)="toggleMenu()">Settings</a>
        <div class="mobile-notification">
          <app-notification-bell></app-notification-bell>
        </div>
        <a mat-button (click)="logout(); toggleMenu()">Logout</a>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .admin-navbar {
      background: #1e293b;
      color: white;
      padding: 10px 20px;
      position: relative;
      
      a {
        color: white;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.3s ease-in-out;

        &:hover {
          color: #38bdf8;
        }
      }

      .mobile-menu {
        display: flex;
        flex-direction: column;
        background: #1e293b;
        padding: 10px;
        position: absolute;
        top: 60px;
        right: 0;
        width: 200px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        z-index: 1000;
        
        a {
          padding: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          
          &:last-child {
            border-bottom: none;
          }
        }

        .mobile-notification {
          padding: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          justify-content: center;
        }
      }
    }

    .flex {
      display: flex;
    }

    .items-center {
      align-items: center;
    }

    .justify-between {
      justify-content: space-between;
    }

    .w-full {
      width: 100%;
    }

    .ml-3 {
      margin-left: 0.75rem;
    }

    .space-x-6 > * + * {
      margin-left: 1.5rem;
    }

    @media (min-width: 768px) {
      .hidden.md\\:flex {
        display: flex;
      }

      .md\\:hidden {
        display: none;
      }
    }

    @media (max-width: 767px) {
      .hidden {
        display: none;
      }
    }
  `]
})
export class AdminNavbarComponent {
  menuOpen = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.authService.logout();
  }
}