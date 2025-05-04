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
  ]
};
