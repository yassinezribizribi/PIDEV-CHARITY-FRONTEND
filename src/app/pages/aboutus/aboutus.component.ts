import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CountUpModule } from 'ngx-countup';
import { CtaComponent } from '../../components/cta/cta.component';
import { TeamComponent } from '../../components/team/team.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { AboutOneComponent } from "../../components/about-one/about-one.component";

@Component({
    selector: 'app-aboutus',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        CountUpModule,
        CtaComponent,
        TeamComponent,
        FooterComponent,
        ScrollToTopComponent,
        AboutOneComponent
    ],
    templateUrl: './aboutus.component.html',
    styleUrl: './aboutus.component.scss'
})
export class AboutusComponent {
  isOpen:any = false;

  togggleModal(e:any){
    e.preventDefault();
    this.isOpen = !this.isOpen;
  }

  counterData = [
    {
      icon:'check-circle',
      title:'Project Completed',
      value:49
    },
    {
      icon:'coffee',
      title:'Cup of Coffee',
      value:2461
    },
    {
      icon:'user-check',
      title:'Client Satisfaction',
      value:99
    },
    {
      icon:'box',
      title:'Country Offices',
      value:7
    },
  ]
}
