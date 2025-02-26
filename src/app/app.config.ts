import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { JobSearchService } from './services/job-application.service';
import { JobOfferService } from './services/jof-offer.service';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    JobSearchService,
    JobOfferService,
    provideAnimations()
  ]
};
