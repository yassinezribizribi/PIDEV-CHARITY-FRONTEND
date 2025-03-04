import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavSettingComponent } from '@component/nav-setting/nav-setting.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-admin-navbar',
  imports: [
    CommonModule,
    RouterLink,
    NavSettingComponent,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
  ],
  templateUrl: './admin-navbar.component.html',
  standalone: true,
  styleUrls: ['./admin-navbar.component.scss']
})
export class AdminNavbarComponent {
  // Property to track the menu's state
  menuOpen = false;

  constructor(private router: Router) {}

  // Method to toggle the menu visibility
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Method to handle logout
  logout() {
    localStorage.removeItem('auth_token');  // Remove token or session
    window.location.href="/"
  }
}
