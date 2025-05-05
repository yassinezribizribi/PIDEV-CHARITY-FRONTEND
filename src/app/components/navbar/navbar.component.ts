import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import * as feather from 'feather-icons';
import { NavSettingComponent } from '../nav-setting/nav-setting.component';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavSettingComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  toggle: boolean = false;
  menu: string = "";
  scroll: boolean = false;
  
  isLoggedIn$;
  isAdmin$;

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService
  ) {
    this.menu = this.router.url;
    window.scrollTo(0, 0);
    
    // Initialize observables after services are injected
    this.isLoggedIn$ = this.authService.isAuthenticated$;
    this.isAdmin$ = this.adminService.isAdmin$;
  }

  ngAfterViewInit() {
    feather.replace();
  }

  toggleMenu(e: any) {
    e.preventDefault();
    this.toggle = !this.toggle;
  }

  setmanu(item: any, e: any) {
    e.preventDefault();
    if (this.menu === item) {
      this.menu = "";
    } else {
      this.menu = item;
    }
  }

  @HostListener('window:scroll', [])
  scrollHandler() {
    this.scroll = window.scrollY > 50;
  }
  @Input() activeSection:any;

  scrollToSection(sectionId: string, e:any) {
    e.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    this.activeSection = sectionId;
  }

  logout() {
    this.authService.logout();
  }

  handleLogoClick(event: Event) {
    event.preventDefault();
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/index']);
    }
  }
}
