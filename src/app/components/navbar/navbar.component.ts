import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import * as feather from 'feather-icons';
import { NavSettingComponent } from '../nav-setting/nav-setting.component';
@Component({
    selector: 'app-navbar',
    imports: [
        CommonModule,
        RouterLink,
        NavSettingComponent
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  ngAfterViewInit() {
    feather.replace();
  }

  toggle:boolean = false

  toggleMenu(e:any){
    e.preventDefault();
    this.toggle = !this.toggle;
  }

  menu:string = ""

  constructor(private router:Router){
    this.menu = this.router.url,
    window.scrollTo(0, 0)
  }

  setmanu(item:any, e:any){
    e.preventDefault();
    if(this.menu === item){
      this.menu = ""
    }else{
      this.menu = item
    }
  }

  scroll:boolean = false

  @HostListener('window:scroll',[])

  scrollHandler(){
    if(window.scrollY > 50){
      this.scroll = true
    }else{
      this.scroll = false
    }
    
  }
}
