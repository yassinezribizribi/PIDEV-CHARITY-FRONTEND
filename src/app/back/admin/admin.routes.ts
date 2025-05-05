import { Routes } from '@angular/router';
import { AdminGuard } from '../../guards/admin.guard';


export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => 
      import('./admin-login/admin-login.component')
        .then(m => m.AdminLoginComponent)
  },
  {
    path: '',
    loadComponent: () => 
      import('./admin-dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent),
        
        canActivate: [AdminGuard]  // Added guard here
  },
  {
    path: 'associations/:id',
    loadComponent: () => 
      import('./association-details/association-details.component')
        .then(m => m.AssociationDetailsComponent),
        
    
   
  }
  
  
]; 