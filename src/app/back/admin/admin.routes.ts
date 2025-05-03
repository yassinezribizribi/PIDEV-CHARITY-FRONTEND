import { Routes } from '@angular/router';
import { AdminGuard } from '../../guards/admin.guard';
import { EditAnimalComponent } from './edit-animal/edit-animal.component';
import { FormationsComponent } from './formations/formations.component';
import { EventsAdminComponent } from './events-admin/events-admin.component';
import { AddEventComponent } from './add-event/add-event.component';
import { ViewEventAdminComponent } from './view-event-admin/view-event-admin.component';
import { EditEventAdminComponent } from './edit-event-admin/edit-event-admin.component';
import { AnimalsAdminComponent } from './animals-admin/animals-admin.component';
import { AddanimaladminComponent } from './addanimaladmin/addanimaladmin.component';
import { PostsManageComponent } from './posts-management/posts-manage.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { DemandeAnimalListComponent } from './demande-animal-list/demande-animal-list.component';


export const ADMIN_ROUTES: Routes = [
  // {
  //   path: 'login',
  //   loadComponent: () => 
  //     import('./admin-login/admin-login.component')
  //       .then(m => m.AdminLoginComponent)
  // },
  {
    path: '',
    loadComponent: () => 
      import('./admin-dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent),
   
  },
  {path:"",canActivate:[AuthGuard],children:[
    {path:"formations",component:FormationsComponent},
    { path: 'add-animals', component: AddanimaladminComponent },
    {path:'events-admin', component:EventsAdminComponent},
    {path:'add-event', component:AddEventComponent},
    {path:'demande', component:DemandeAnimalListComponent},
    {path:'view-event-admin/:id', component:ViewEventAdminComponent},
    {path:'edit-event-admin/:id', component:EditEventAdminComponent},
      { path: 'animals-admin', component: AnimalsAdminComponent },
      { path: 'edit-animal/:id', component: EditAnimalComponent },
        { path: 'posts-manage', component: PostsManageComponent },
      
  ]},

  {
    path: 'associations/:id',
    loadComponent: () => 
      import('./association-details/association-details.component')
        .then(m => m.AssociationDetailsComponent),
   
  },
  


]; 