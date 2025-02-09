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
import { BlogDetailComponent } from './pages/blog-detail/blog-detail.component';
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

export const routes: Routes = [
    {path:'', component:IndexComponent},
    {path:'onepage', component:OnepageComponent},
    {path:'aboutus', component:AboutusComponent},
    {path:'services', component:ServicesComponent},
    {path:'service-detail', component:ServiceDetailComponent},
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
    {path:'reset-password', component:ResetPasswordComponent},
    {path:'lock-screen', component:LockScreenComponent},
    {path:'terms', component:TermsComponent},
    {path:'privacy', component:PrivacyComponent},
    {path:'comingsoon', component:ComingsoonComponent},
    {path:'maintenance', component:MaintenanceComponent},
    {path:'error', component:ErrorComponent},
    {path:'contactus', component:ContactusComponent},
];
