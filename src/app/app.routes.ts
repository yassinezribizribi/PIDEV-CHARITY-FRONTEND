import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { AboutusComponent } from './pages/aboutus/aboutus.component';
import { ServicesComponent } from './pages/services/services.component';
import { ServiceDetailComponent } from './pages/service-detail/service-detail.component';
import { ForumsComponent } from './pages/forums/forums.component';
import { TeamComponent } from './pages/team/team.component';
import { TestimonialComponent } from './pages/testimonial/testimonial.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { BlogSidebarComponent } from './pages/events/blog-sidebar.component';
import { BlogDetailComponent } from './pages/events-details/blog-detail.component';
import { OnepageComponent } from './pages/onepage/onepage.component';
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
import { AdminGuard } from './guards/admin.guard';
import { ReactiveFormsModule } from '@angular/forms';


import { JobOpportunitiesForumComponent } from './pages/forums/job-opportunities-forum/job-opportunities-forum.component';
import { SupportRefugeesComponent } from './pages/forums/support-refugees-forum/support-refugees-forum.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminNavbarComponent } from './back/admin/admin-navbar/admin-navbar.component';
import { FormulaireEventsComponent } from './pages/formulaire-events/formulaire-events.component';
import { TrainingComponent } from './pages/training/training.component';
import { TrainingDetailsComponent } from './pages/training-details/training-details.component';
import { FormulaireTrainingComponent } from './pages/formulaire-training/formulaire-training.component';
import { EventsAdminComponent } from './back/admin/events-admin/events-admin.component';

export const routes: Routes = [
  { path: '', redirectTo: 'onepage', pathMatch: 'full' },
  { path: 'onepage', component: OnepageComponent },
  
    {path:'index', component:IndexComponent,canActivate:[AuthGuard]},
    {path:'aboutus', component:AboutusComponent},
    {path:'services', component:ServicesComponent},
    {path:'service-detail', component:ServiceDetailComponent},
    {path:'forums', component:ForumsComponent},
    {path:'team', component:TeamComponent},
    {path:'testimonial', component:TestimonialComponent},
    {path:'faqs', component:FaqsComponent},
    {path:'blogs', component:BlogsComponent},
    {path:'blog-sidebar', component:BlogSidebarComponent},
    {path:'trainig', component:TrainingComponent},
    {path:'training-details/:id', component:TrainingDetailsComponent},
    {path:'training-details', component:TrainingDetailsComponent},
    {path:'formulaire-training/:id', component:FormulaireTrainingComponent},

    {path:'blog-detail', component:BlogDetailComponent},
    {path:'blog-detail/:id', component:BlogDetailComponent},
    {path:'login', component:LoginComponent},
    {path:'signup', component:SignupComponent},
    {path:'signup/:role', component:SignupComponent},
    { path: 'formulaire-events/:idEvent', component: FormulaireEventsComponent },    
    {path:'reset-password', component:ResetPasswordComponent},
    {path:'lock-screen', component:LockScreenComponent},
    {path:'terms', component:TermsComponent},
    {path:'privacy', component:PrivacyComponent},
    {path:'comingsoon', component:ComingsoonComponent},
    {path:'maintenance', component:MaintenanceComponent},
    {path:'error', component:ErrorComponent},
    {path:'contactus', component:ContactusComponent},
    {path:'admin-navbar', component:AdminNavbarComponent},
    {path:'events-admin', component:EventsAdminComponent},

    {
      path: 'association-signup',
      loadComponent: () => 
        import('./pages/association/association-signup/association-signup.component')
          .then(m => m.AssociationSignupComponent)
    },
    {
      path: 'association-login',
      loadComponent: () => 
        import('./back/association-login/association-login.component')
          .then(m => m.AssociationLoginComponent)
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
        {
          path: '',
          component: ForumsComponent
        },
        { path: 'job-opportunities', component: JobOpportunitiesForumComponent,canActivate:[AuthGuard] }
        ,
        {
          path: 'support-refugees',
          component: SupportRefugeesComponent
        }
      ]
    }

    
    


    
];
