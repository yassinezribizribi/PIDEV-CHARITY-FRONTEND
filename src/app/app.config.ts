import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { NotificationComponent } from './pages/notification/notification.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: '/service-detail', redirectTo: 'notifications', pathMatch: 'full' }, // ✅ Redirection initiale
      { path: 'notifications', component: NotificationComponent }, // ✅ Page des notifications // ✅ Page Service Detail
      { path: '**', redirectTo: 'notifications' } // ✅ Redirection si route inconnue
    ], withComponentInputBinding())
  ]
};
