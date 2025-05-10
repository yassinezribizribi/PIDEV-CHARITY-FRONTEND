import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    AdminNavbarComponent
  ],
  template: `
    <app-admin-navbar></app-admin-navbar>

    <div class="container-fluid p-4 mt-4">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3">
          <div class="settings-sidebar card shadow-sm border-0 rounded-4 mb-4">
            <div class="card-header bg-transparent border-0 pt-4 pb-3 px-4">
              <h5 class="mb-0 fw-bold text-primary">
                <i class="bi bi-gear-fill me-2"></i>
                Settings
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <button class="list-group-item list-group-item-action d-flex align-items-center" 
                        [class.active]="currentSection === 'general'"
                        (click)="currentSection = 'general'">
                  <i class="bi bi-gear-fill me-3 fs-5"></i>
                  <span>General Settings</span>
                </button>
                <button class="list-group-item list-group-item-action d-flex align-items-center" 
                        [class.active]="currentSection === 'notifications'"
                        (click)="currentSection = 'notifications'">
                  <i class="bi bi-bell-fill me-3 fs-5"></i>
                  <span>Notification Settings</span>
                </button>
                <button class="list-group-item list-group-item-action d-flex align-items-center" 
                        [class.active]="currentSection === 'security'"
                        (click)="currentSection = 'security'">
                  <i class="bi bi-shield-lock-fill me-3 fs-5"></i>
                  <span>Security Settings</span>
                </button>
                <button class="list-group-item list-group-item-action d-flex align-items-center" 
                        [class.active]="currentSection === 'appearance'"
                        (click)="currentSection = 'appearance'">
                  <i class="bi bi-palette-fill me-3 fs-5"></i>
                  <span>Appearance</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9">
          <!-- General Settings -->
          <div *ngIf="currentSection === 'general'" class="settings-card card shadow-sm border-0 rounded-4">
            <div class="card-header bg-transparent border-0 pt-4 pb-3 px-4">
              <div class="d-flex align-items-center">
                <div class="icon-circle bg-primary-subtle me-3">
                  <i class="bi bi-gear-fill text-primary"></i>
                </div>
                <div>
                  <h4 class="mb-0 fw-bold">General Settings</h4>
                  <p class="text-muted mb-0">Configure your platform's basic settings</p>
                </div>
              </div>
            </div>
            <div class="card-body p-4">
              <form (ngSubmit)="saveGeneralSettings()">
                <div class="row">
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold">Site Name</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-globe"></i>
                      </span>
                      <input type="text" class="form-control" [(ngModel)]="settings.siteName" name="siteName">
                    </div>
                  </div>
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold">Admin Email</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-envelope"></i>
                      </span>
                      <input type="email" class="form-control" [(ngModel)]="settings.adminEmail" name="adminEmail">
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold">Default Language</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-translate"></i>
                      </span>
                      <select class="form-select" [(ngModel)]="settings.defaultLanguage" name="defaultLanguage">
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold">Time Zone</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-clock"></i>
                      </span>
                      <select class="form-select" [(ngModel)]="settings.timeZone" name="timeZone">
                        <option value="UTC">UTC</option>
                        <option value="GMT+1">GMT+1</option>
                        <option value="GMT+2">GMT+2</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="submit" class="btn btn-primary px-4">
                    <i class="bi bi-save me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Notification Settings -->
          <div *ngIf="currentSection === 'notifications'" class="settings-card card shadow-sm border-0 rounded-4">
            <div class="card-header bg-transparent border-0 pt-4 pb-3 px-4">
              <div class="d-flex align-items-center">
                <div class="icon-circle bg-primary-subtle me-3">
                  <i class="bi bi-bell-fill text-primary"></i>
                </div>
                <div>
                  <h4 class="mb-0 fw-bold">Notification Settings</h4>
                  <p class="text-muted mb-0">Manage your notification preferences</p>
                </div>
              </div>
            </div>
            <div class="card-body p-4">
              <form (ngSubmit)="saveNotificationSettings()">
                <div class="notification-item mb-4">
                  <div class="d-flex align-items-center">
                    <div class="form-check form-switch me-3">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="settings.emailNotifications" name="emailNotifications">
                    </div>
                    <div>
                      <label class="form-check-label fw-bold">Email Notifications</label>
                      <p class="text-muted mb-0">Receive notifications via email</p>
                    </div>
                  </div>
                </div>
                <div class="notification-item mb-4">
                  <div class="d-flex align-items-center">
                    <div class="form-check form-switch me-3">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="settings.pushNotifications" name="pushNotifications">
                    </div>
                    <div>
                      <label class="form-check-label fw-bold">Push Notifications</label>
                      <p class="text-muted mb-0">Receive push notifications in browser</p>
                    </div>
                  </div>
                </div>
                <div class="notification-item mb-4">
                  <div class="d-flex align-items-center">
                    <div class="form-check form-switch me-3">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="settings.newUserNotifications" name="newUserNotifications">
                    </div>
                    <div>
                      <label class="form-check-label fw-bold">New User Alerts</label>
                      <p class="text-muted mb-0">Get notified when new users register</p>
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="submit" class="btn btn-primary px-4">
                    <i class="bi bi-save me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Security Settings -->
          <div *ngIf="currentSection === 'security'" class="settings-card card shadow-sm border-0 rounded-4">
            <div class="card-header bg-transparent border-0 pt-4 pb-3 px-4">
              <div class="d-flex align-items-center">
                <div class="icon-circle bg-primary-subtle me-3">
                  <i class="bi bi-shield-lock-fill text-primary"></i>
                </div>
                <div>
                  <h4 class="mb-0 fw-bold">Security Settings</h4>
                  <p class="text-muted mb-0">Manage your security preferences</p>
                </div>
              </div>
            </div>
            <div class="card-body p-4">
              <form (ngSubmit)="saveSecuritySettings()">
                <div class="security-item mb-4">
                  <div class="d-flex align-items-center">
                    <div class="form-check form-switch me-3">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="settings.twoFactorAuth" name="twoFactorAuth">
                    </div>
                    <div>
                      <label class="form-check-label fw-bold">Two-Factor Authentication</label>
                      <p class="text-muted mb-0">Require 2FA for admin access</p>
                    </div>
                  </div>
                </div>
                <div class="security-item mb-4">
                  <div class="d-flex align-items-center">
                    <div class="form-check form-switch me-3">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="settings.sessionTimeout" name="sessionTimeout">
                    </div>
                    <div>
                      <label class="form-check-label fw-bold">Session Timeout</label>
                      <p class="text-muted mb-0">Automatically log out after 30 minutes of inactivity</p>
                    </div>
                  </div>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-bold">Password Policy</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light">
                      <i class="bi bi-key"></i>
                    </span>
                    <select class="form-select" [(ngModel)]="settings.passwordPolicy" name="passwordPolicy">
                      <option value="standard">Standard (8+ characters)</option>
                      <option value="strong">Strong (12+ characters, special chars)</option>
                      <option value="very-strong">Very Strong (16+ characters, special chars, numbers)</option>
                    </select>
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="submit" class="btn btn-primary px-4">
                    <i class="bi bi-save me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Appearance Settings -->
          <div *ngIf="currentSection === 'appearance'" class="settings-card card shadow-sm border-0 rounded-4">
            <div class="card-header bg-transparent border-0 pt-4 pb-3 px-4">
              <div class="d-flex align-items-center">
                <div class="icon-circle bg-primary-subtle me-3">
                  <i class="bi bi-palette-fill text-primary"></i>
                </div>
                <div>
                  <h4 class="mb-0 fw-bold">Appearance Settings</h4>
                  <p class="text-muted mb-0">Customize your platform's look and feel</p>
                </div>
              </div>
            </div>
            <div class="card-body p-4">
              <form (ngSubmit)="saveAppearanceSettings()">
                <div class="row">
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold">Theme</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-brush"></i>
                      </span>
                      <select class="form-select" [(ngModel)]="settings.theme" name="theme" (change)="onThemeChange($event)">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-bold">Primary Color</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light">
                        <i class="bi bi-palette"></i>
                      </span>
                      <input type="color" class="form-control form-control-color" [(ngModel)]="settings.primaryColor" name="primaryColor">
                    </div>
                  </div>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-bold">Font Size</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light">
                      <i class="bi bi-type"></i>
                    </span>
                    <select class="form-select" [(ngModel)]="settings.fontSize" name="fontSize">
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="submit" class="btn btn-primary px-4">
                    <i class="bi bi-save me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-sidebar {
      position: sticky;
      top: 1rem;
    }

    .settings-card {
      transition: all 0.3s ease;
    }

    .settings-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
    }

    .list-group-item {
      border: none;
      padding: 1rem 1.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--text-primary);
    }

    .list-group-item:hover {
      background-color: var(--hover-bg);
      padding-left: 2rem;
    }

    .list-group-item.active {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      border-left: 4px solid #0d6efd;
    }

    .list-group-item i {
      transition: all 0.3s ease;
    }

    .list-group-item:hover i {
      transform: scale(1.1);
    }

    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-circle i {
      font-size: 1.5rem;
    }

    .form-label {
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .form-control, .form-select {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      background-color: var(--input-bg);
      color: var(--text-primary);
      border-color: var(--border-color);
    }

    .form-control:focus, .form-select:focus {
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
      background-color: var(--input-bg);
      color: var(--text-primary);
    }

    .input-group-text {
      border-color: var(--border-color);
      background-color: var(--bg-secondary);
      color: var(--text-primary);
    }

    .form-check-input {
      width: 3rem;
      height: 1.5rem;
      margin-top: 0;
    }

    .form-check-input:checked {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(13, 110, 253, 0.2);
    }

    .notification-item, .security-item {
      padding: 1rem;
      border-radius: 0.5rem;
      background-color: var(--bg-secondary);
      transition: all 0.3s ease;
    }

    .notification-item:hover, .security-item:hover {
      background-color: var(--hover-bg);
    }

    .text-muted {
      font-size: 0.875rem;
    }

    .form-control-color {
      height: 38px;
      padding: 0.375rem;
    }

    @media (max-width: 768px) {
      .settings-sidebar {
        position: static;
        margin-bottom: 1rem;
      }
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  currentSection = 'general';
  settings = {
    // General Settings
    siteName: 'Refugee Support Platform',
    adminEmail: 'admin@example.com',
    defaultLanguage: 'en',
    timeZone: 'UTC',

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    newUserNotifications: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: true,
    passwordPolicy: 'strong',

    // Appearance Settings
    theme: 'light',
    primaryColor: '#0d6efd',
    fontSize: 'medium'
  };

  constructor(
    private snackBar: MatSnackBar,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Load settings from backend
    this.loadSettings();
    
    // Set initial theme
    this.settings.theme = this.themeService.getTheme();
  }

  loadSettings() {
    // TODO: Load settings from backend
  }

  onThemeChange(event: any) {
    const theme = event.target.value;
    if (theme === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.themeService.setTheme(prefersDark ? 'dark' : 'light');
    } else {
      this.themeService.setTheme(theme);
    }
  }

  saveGeneralSettings() {
    // TODO: Save general settings to backend
    this.snackBar.open('General settings saved successfully', 'Close', { duration: 3000 });
  }

  saveNotificationSettings() {
    // TODO: Save notification settings to backend
    this.snackBar.open('Notification settings saved successfully', 'Close', { duration: 3000 });
  }

  saveSecuritySettings() {
    // TODO: Save security settings to backend
    this.snackBar.open('Security settings saved successfully', 'Close', { duration: 3000 });
  }

  saveAppearanceSettings() {
    // TODO: Save appearance settings to backend
    this.snackBar.open('Appearance settings saved successfully', 'Close', { duration: 3000 });
  }
} 