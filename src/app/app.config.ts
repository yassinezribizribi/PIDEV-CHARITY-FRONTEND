<<<<<<< HEAD
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { JobSearchService } from './services/job-application.service';
import { JobOfferService } from './services/jof-offer.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';


export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(ReactiveFormsModule),
    provideHttpClient(withInterceptors([])),
    provideRouter(routes),
    JobSearchService,
    JobOfferService,

    provideAnimations()
=======
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
>>>>>>> e58fb8da9dfcee386ba2f04dbaa43657390d4200
  ]
};
