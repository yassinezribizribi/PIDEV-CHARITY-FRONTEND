import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-nav-setting',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './nav-setting.component.html',
    styleUrl: './nav-setting.component.scss'
})
export class NavSettingComponent {
    isLoggedIn$;
    user$ = new BehaviorSubject<User | null>(null);

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        this.isLoggedIn$ = this.authService.isAuthenticated$;
        const userInfo = this.authService.getUserInfo();
        if (userInfo) {
            this.user$.next({
                idUser: userInfo.idUser || 0,
                email: userInfo.email || '',
                role: userInfo.role || ''
            });
        }

        // Subscribe to router events
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            // Navigation completed
        });
    }

    logout() {
        this.authService.logout();
    }

    onProfileClick() {
        this.router.navigate(['/app-profile']);
    }
}