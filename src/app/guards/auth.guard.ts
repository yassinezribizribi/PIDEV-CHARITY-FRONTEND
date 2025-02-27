import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
      
      const isAuthenticated = await firstValueFrom(this.authService.isAuthenticated$);
      
      if (isAuthenticated) {
        return true;  // ✅ Utilisateur connecté
      } else {
        this.router.navigate(['/onepage']); // 🔴 Rediriger vers login
        return false;
      }
  }
}
