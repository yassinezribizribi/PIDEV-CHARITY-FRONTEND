import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { TeamComponent } from '../../components/team/team.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-services',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        CtaComponent,
        TeamComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './services.component.html',
    styleUrl: './services.component.scss'
})
export class ServicesComponent {
  servicesData = [
    {
      icon:'aperture' ,
      title:'Breakfast Programme',
      desc:"We've cultivated a dynamic space where creativity seamlessly intertwines with strategy and innovation."
    },
    {
      icon:'send' ,
      title:'Food Assistance',
      desc:"We've cultivated a dynamic space where creativity seamlessly intertwines with strategy and innovation."
    },
    {
      icon:'users' ,
      title:'Social Works',
      desc:"We've cultivated a dynamic space where creativity seamlessly intertwines with strategy and innovation."
    },
    {
      icon:'star' ,
      title:'Digital Education',
      desc:"We've cultivated a dynamic space where creativity seamlessly intertwines with strategy and innovation."
    },
    {
      icon:'bookmark' ,
      title:'Scholarship Programme',
      desc:"We've cultivated a dynamic space where creativity seamlessly intertwines with strategy and innovation."
    },
    {
      icon:'message-circle' ,
      title:'School Programme',
      desc:"We've cultivated a dynamic space where creativity seamlessly intertwines with strategy and innovation."
    }
  ]
}
