import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRole = route.data['role']; // Role required for this route
    const userRole = this.authService.getUserRole(); // Get current user role from AuthService

    if (userRole) {
      return true;
    } else {
      this.router.navigate(['/onepage']); // Redirect to error page if unauthorized
      return false;
    }
  }
}  