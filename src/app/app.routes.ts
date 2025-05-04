import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { AboutusComponent } from './pages/aboutus/aboutus.component';
import {HealthcareComponent } from './pages/Healthcare/healthcare.component';
import { NotificationComponent } from './pages/notification/notification.component';
import { ForumsComponent } from './pages/forums/forums.component';
import { TranslationComponent, } from './pages/translation/translation.component';
import { TestimonialComponent } from './pages/testimonial/testimonial.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { BlogSidebarComponent } from './pages/blog-sidebar/blog-sidebar.component';
import { BlogDetailComponent } from './pages/post/blog-detail.component';
import { OnepageComponent } from './pages/onepage/onepage.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { LockScreenComponent } from './pages/lock-screen/lock-screen.component';
import { TermsComponent } from './pages/terms/terms.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { ComingsoonComponent } from './pages/comingsoon/comingsoon.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { ErrorComponent } from './pages/error/error.component';
import { ContactusComponent } from './pages/contactus/contactus.component';
import { AdminGuard } from './guards/admin.guard';  // Import the guard
import { AssociationSignupComponent } from './pages/association/association-signup/association-signup.component'; // Import the component
import { AssociationAccountComponent } from './back/association-account/association-account.component'; // Import the component
import { ReactiveFormsModule } from '@angular/forms';

import { AssociationTestComponent } from './pages/association/association-test/association-test.component';
import { JobOpportunitiesForumComponent } from './pages/forums/job-opportunities-forum/job-opportunities-forum.component';
import { SupportRefugeesComponent } from './pages/forums/support-refugees-forum/support-refugees-forum.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminNavbarComponent } from './back/admin/admin-navbar/admin-navbar.component';

export const routes: Routes = [
  { path: '', redirectTo: 'onepage', pathMatch: 'full' },
  { path: 'onepage', component: OnepageComponent },
  { path: 'index', component: IndexComponent, canActivate: [AuthGuard] },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'services', component: HealthcareComponent },
  { path: 'notification', component: NotificationComponent },
  { path: 'forums', component: ForumsComponent },
  { path: 'team', component: TranslationComponent },
  { path: 'testimonial', component: TestimonialComponent },
  { path: 'faqs', component: FaqsComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'blog-sidebar', component: BlogSidebarComponent },
  { path: 'blog-detail', component: BlogDetailComponent },
  { path: 'blog-detail/:id', component: BlogDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'signup/:role', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'lock-screen', component: LockScreenComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'comingsoon', component: ComingsoonComponent },
  { path: 'maintenance', component: MaintenanceComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'contactus', component: ContactusComponent },
  { path: 'admin-navbar', component: AdminNavbarComponent },

  { path: 'service-detail', component: NotificationComponent }, // ✅ Ajouté ici, en dehors de "forums"

  {
    path: 'association-signup',
    loadComponent: () =>
      import('./pages/association/association-signup/association-signup.component')
        .then(m => m.AssociationSignupComponent)
  },

  {
    path: 'association/account',
    loadComponent: () =>
      import('./back/association-account/association-account.component')
        .then(m => m.AssociationAccountComponent)
  },

  {
    path: 'admin',
    loadChildren: () => import('./back/admin/admin.routes')
      .then(m => m.ADMIN_ROUTES)
  },

  {
    path: 'forums',
    children: [
      { path: '', component: ForumsComponent },
      { path: 'job-opportunities', component: JobOpportunitiesForumComponent },
      { path: 'support-refugees', component: SupportRefugeesComponent }
    ]
  },

  { path: '**', redirectTo: '/' }
];
