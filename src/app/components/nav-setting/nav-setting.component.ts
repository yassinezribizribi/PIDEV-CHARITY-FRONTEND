import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-nav-setting',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './nav-setting.component.html',
    styleUrl: './nav-setting.component.scss'
})
export class NavSettingComponent implements OnInit{
    isAuthenticated: boolean = false;

constructor(private authService: AuthService){}
ngOnInit(): void {
    
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        console.log(isAuthenticated)
      });
    
  }
logout(){
this.authService.logout()
}
}
