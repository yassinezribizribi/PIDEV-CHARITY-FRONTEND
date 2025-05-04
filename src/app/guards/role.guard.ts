import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Get required roles from route data
    const requiredRoles = next.data['roles'] as string[];
    
    // Check authentication first
    if (!this.auth.isAuthenticated()) {
      this.redirectToLogin(state.url);
      return false;
    }

    // Check roles if specified
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = this.auth.getUserRoles();
      const hasAccess = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasAccess) {
        this.redirectUnauthorized();
        return false;
      }
    }

    return true;
  }

  private redirectToLogin(returnUrl: string): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl },
      state: { clearHistory: true }
    });
  }

  private redirectUnauthorized(): void {
    this.router.navigate(['/unauthorized']);
  }
}