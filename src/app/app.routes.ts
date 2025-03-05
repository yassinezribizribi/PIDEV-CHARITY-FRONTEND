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
import { BlogSidebarComponent } from './pages/blog-sidebar/blog-sidebar.component';
import { BlogDetailComponent } from './pages/post/blog-detail.component';
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
import { RegisterAssociationComponent } from './register-association/register-association.component';
import { AssociationDetailsComponent } from './back/admin/association-details/association-details.component';
import { JobOpportunitiesForumComponent } from './pages/forums/job-opportunities-forum/job-opportunities-forum.component';
import { SupportRefugeesForumComponent } from './pages/forums/support-refugees-forum/support-refugees-forum.component';
import { AuthGuard } from './guards/auth.guard';
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
export const routes: Routes = [
  { path: '', redirectTo: 'onepage', pathMatch: 'full' },
  { path: 'onepage', component: OnepageComponent },
  
  { path: 'support-refugees-forum/:idRequest', component: SupportRefugeesForumComponent },

  { path: 'index', component: IndexComponent, canActivate: [AuthGuard] },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'service-detail', component: ServiceDetailComponent },
  { path: 'forums', component: ForumsComponent },
  { path: 'team', component: TeamComponent },
  { path: 'testimonial', component: TestimonialComponent },
  { path: 'faqs', component: FaqsComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'blog-sidebar', component: BlogSidebarComponent },
  { path: 'blog-detail', component: BlogDetailComponent },
  { path: 'blog-detail/:id', component: BlogDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'signup/:role', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'lock-screen', component: LockScreenComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'comingsoon', component: ComingsoonComponent },
  { path: 'maintenance', component: MaintenanceComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'contactus', component: ContactusComponent },
  {path :'associationList',component:AssociationListComponent},
  { path: 'admin-navbar', component: AdminNavbarComponent },
  { path: 'register-association', component: RegisterAssociationComponent },
  { path: 'app-admin-dashboard', component: AdminDashboardComponent },
  { path: 'associations/:id', component: AssociationDetailsComponent },
  { path: 'blog-detail-copy/:id', component: BlogDetailComponentCopy },
  { path: 'make-donation/:idDonation', component: MakeDonationComponent },
  { path: 'blog-sidebar-copy', component: BlogSidebarComponentCopy },

  {
    path: 'association',
    children: [
      {
        path: 'account',
        component: AssociationAccountComponent,
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
  }
];