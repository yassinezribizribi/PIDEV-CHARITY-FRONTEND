import { CommonModule } from '@angular/common';
import { Component, HostListener,  Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavSettingComponent } from '../nav-setting/nav-setting.component';
import * as feather from 'feather-icons'

@Component({
    selector: 'app-single-navbar',
    imports: [
        CommonModule,
        RouterLink,
        NavSettingComponent
    ],
    templateUrl: './single-navbar.component.html',
    styleUrl: './single-navbar.component.scss'
})
export class SingleNavbarComponent {

  ngAfterViewInit(): void {
    feather.replace()
  }

  toggle:boolean = false

  toggleMenu(e:any){
    e.preventDefault();
    this.toggle = !this.toggle;
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

  @Input() activeSection:any;

  scrollToSection(sectionId: string, e:any) {
    e.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    this.activeSection = sectionId;
  }

}
