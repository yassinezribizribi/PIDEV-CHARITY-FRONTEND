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
import { JobApplicationsComponent } from './job-applications/job-applications.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { ComingsoonComponent } from './pages/comingsoon/comingsoon.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { ErrorComponent } from './pages/error/error.component';
import { ContactusComponent } from './pages/contactus/contactus.component';
import { AdminGuard } from './guards/admin.guard';
import { RegisterAssociationComponent } from './register-association/register-association.component';
import { AssociationDetailsComponent } from './back/admin/association-details/association-details.component';
import { ReactiveFormsModule } from '@angular/forms';

import { JobOpportunitiesForumComponent } from './pages/forums/job-opportunities-forum/job-opportunities-forum.component';
import { SupportRefugeesForumComponent } from './pages/forums/support-refugees-forum/support-refugees-forum.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AdminNavbarComponent } from './back/admin/admin-navbar/admin-navbar.component';
import { AssociationListComponent } from './pages/associationList/associationList.component';
import { AdminDashboardComponent } from './back/admin/admin-dashboard/admin-dashboard.component';
import { AssociationDonationFormComponent } from './back/association-donation-form/association-donation-form.component';
import { AssociationAccountComponent } from './back/association-account/association-account.component';
import { AssociationMissionFormComponent } from './back/association-mission-form/association-mission-form.component';
import { MakeDonationComponent } from '@component/make-donation/make-donation.component';
import { BlogSidebarComponentCopy } from './pages/blog-sidebar copy/blog-sidebar.component';
import { BlogDetailComponentCopy } from './pages/post copy/blog-detail.component';
import { ListRequestComponent } from './pages/forums/list-request/list-request.component';
import { EditMissionComponent } from './back/edit-mission/edit-mission.component';
import { EditDonationComponent } from './back/edit-donation/edit-donation.component';
import { ProfileComponent } from './profile/profile.component';
import { ApplicationDetailsComponent } from './application-details/application-details.component';
import { AssociationProfileComponent } from './pages/association-profile/association-profile.component';


import { ValidateDonsComponent } from './back/validate-dons/validate-dons.component';
import { CagnotteDetailsComponent } from '@component/cagnotte-details/cagnotte-details.component';
import { UserDonsComponent } from './components/user-dons/user-dons.component';
import { UpdateDonsComponent } from './components/update-dons/update-dons.component';
import { UpdateDonsNonauthComponent } from './components/update-dons-nonauth/update-dons-nonauth.component';
import { VolunteerParticipationsComponent } from './components/volunteer-participations/volunteer-participations.component';


import { AdminSettingsComponent } from './back/admin/admin-settings/admin-settings.component';
import { UsersManagementComponent } from './back/admin/users-management/users-management.component';
import { TeamComponent } from './pages/team/team.component';


export const routes: Routes = [
  { path: '', redirectTo: 'onepage', pathMatch: 'full' },
  { path: 'onepage', component: OnepageComponent },
  
  { path: 'support-refugees-forum/:idRequest', component: SupportRefugeesForumComponent },

  { path: 'index', component: IndexComponent, canActivate: [AuthGuard] },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'forums', component: ForumsComponent },
  { path: 'team', component: TeamComponent },
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
  {path:'jobApplications/:jobOfferId',component:JobApplicationsComponent},
  {path:'applicationDetails/:id',component:ApplicationDetailsComponent},
  {path :'associationList',component:AssociationListComponent},
  { path: 'admin-navbar', component: AdminNavbarComponent },
  { path: 'register-association', component: RegisterAssociationComponent },
  { path: 'app-admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin/associations/:id', component: AssociationDetailsComponent },
  { path: 'associations/:id', component: AssociationProfileComponent },
  { path: 'blog-detail-copy/:id', component: BlogDetailComponentCopy },
  { path: 'validate-dons', component: ValidateDonsComponent },
  { path: 'cagnotte/:id', component: CagnotteDetailsComponent },

  {
    path: 'app-profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  { path: 'make-donation/:idDonation', component: MakeDonationComponent },
  { path: 'blog-sidebar-copy', component: BlogSidebarComponentCopy },

  { path: 'support-refugees-forum/:idRequest', component: SupportRefugeesForumComponent },

    {path:'index', component:IndexComponent,canActivate:[AuthGuard]},
    {path:'aboutus', component:AboutusComponent},
    
      {path:'service-detail', component:NotificationComponent},
    {path:'forums', component:ForumsComponent},
    {path:'team', component:TeamComponent},
    {path:'testimonial', component:TestimonialComponent},
    {path:'faqs', component:FaqsComponent},
    {path:'blogs', component:BlogsComponent},
    {path:'blog-sidebar', component:BlogSidebarComponent},
    {path:'blog-detail', component:BlogDetailComponent},
    {path:'blog-detail/:id', component:BlogDetailComponent},
    {path:'login', component:LoginComponent},
    {path:'signup', component:SignupComponent},
    {path:'signup/:role', component:SignupComponent},
  
    {path:'reset-password', component:ResetPasswordComponent},
    {path:'lock-screen', component:LockScreenComponent},
    {path:'terms', component:TermsComponent},
    {path:'privacy', component:PrivacyComponent},
    {path:'comingsoon', component:ComingsoonComponent},
    {path:'maintenance', component:MaintenanceComponent},
    {path:'error', component:ErrorComponent},
    {path:'contactus', component:ContactusComponent},
    {path:'admin-navbar', component:AdminNavbarComponent},
    
    
   
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
      path: 'admin/users',
      loadComponent: () => import('./back/admin/users-management/users-management.component').then(m => m.UsersManagementComponent),
      canActivate: [AuthGuard]
    },
    {
      path: 'forums',
      children: [
        {
          path: '',
          component: ForumsComponent
        },
        { path: 'job-opportunities', component: JobOpportunitiesForumComponent }
        ,
        {
          path: 'support-refugees',
          component: SupportRefugeesForumComponent
        }
        
        ,{
          path: 'list-rquest',
          component: ListRequestComponent
        }
      ]
    }

  ,{
    path: 'association',
    children: [
      {
        path: 'account',
        component: AssociationAccountComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'missions',
        component: AssociationAccountComponent,  // Temporarily using AssociationAccountComponent
        canActivate: [AuthGuard]
      },
      {
        path: 'account/creedoantion',
        component: AssociationDonationFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'account/creemission',
        component: AssociationMissionFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'account/edit-mission/:id',
        component: EditMissionComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'account/edit-donation/:id',
        component: EditDonationComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  { 
    path: 'services', 
    component: HealthcareComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_VOLUNTEER', 'ROLE_REFUGEE', 'ROLE_ASSOCIATION_MEMBER'] }
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
      { 
        path: 'job-opportunities', 
        component: JobOpportunitiesForumComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'support-refugees', 
        component: SupportRefugeesForumComponent 
      }
      ,{
        path: 'list-rquest',
        component: ListRequestComponent
      }
      
    ]
  },
  {

    path: 'conversation/:id',
    loadComponent: () => import('./conversation/conversation.component').then(m => m.ConversationComponent)
  },
  { 
    path: 'user-dons', 
    component: UserDonsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'update-dons/:id', 
    component: UpdateDonsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'update-dons-nonauth/:id', 
    component: UpdateDonsNonauthComponent
  },
  {
    path: 'my-participations',
    component: VolunteerParticipationsComponent,
    canActivate: [AuthGuard]
  },
  
    {
      path: 'conversation',
      children: [
        { 
          path: '',
        loadComponent: () => import('./conversation/conversation.component').then(m => m.ConversationComponent),
        canActivate: [AuthGuard]
      },
      { 
        path: 'new',
        loadComponent: () => import('./conversation/conversation.component').then(m => m.ConversationComponent),
        canActivate: [AuthGuard]
      },
      { 
        path: ':id',
        loadComponent: () => import('./conversation/conversation.component').then(m => m.ConversationComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./back/admin/users-management/users-management.component').then(m => m.UsersManagementComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UsersManagementComponent },
      { path: 'settings', component: AdminSettingsComponent }
    ]
  },
  { path: '**', redirectTo: '/' }
];


 


 
 

