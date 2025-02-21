import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/pages/login/login.component';
import { SignupComponent } from './app/pages/signup/signup.component';

const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'login' }
];

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), provideRouter(routes)]
}).catch(err => console.error(err));
