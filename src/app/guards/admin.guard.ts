import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.adminService.isAdmin()) {
      this.router.navigate(['/admin/login']);
      return false;
    }
    return true;
  }
} 