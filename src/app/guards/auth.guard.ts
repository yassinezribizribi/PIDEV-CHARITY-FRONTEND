import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (this.authService.isAuthenticated$) {
       // this.router.navigate(['/index']);
       console.log('truuuuuuue')
        return true;  // User is authenticated, allow access to 'index'
      } else {
        console.log('falseeee')
        // User is not authenticated, redirect to 'onepage'
        this.router.navigate(['/onepage']);
        return false;
      }
  }
}  