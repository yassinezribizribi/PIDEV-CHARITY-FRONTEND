import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { HealthcareComponent } from '../../pages/Healthcare/healthcare.component';
import { AboutOneComponent } from '../../components/about-one/about-one.component';
import { AboutTwoComponent } from '../../components/about-two/about-two.component';
import { ClientComponent } from '../../components/client/client.component';
import { BlogComponent } from '../../components/blog/blog.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { HomeBannerComponent } from "../../components/home-banner/home-banner.component";
import { MakeDonationComponent } from "../../components/make-donation/make-donation.component";
import { CausesComponent } from "../../components/causes/causes.component";
import { CtaComponent } from "../../components/cta/cta.component";
import { TeamComponent } from "../../components/team/team.component";
import { TopAssociationsSliderComponent } from '../../components/top-associations-slider/top-associations-slider.component';


@Component({
    selector: 'app-index',
    imports: [
        CommonModule,
        RouterLink,
        HealthcareComponent,
        AboutOneComponent,
        AboutTwoComponent,
        ClientComponent,
        BlogComponent,
        FooterComponent,
        ScrollToTopComponent,
        HomeBannerComponent,
        MakeDonationComponent,
        CausesComponent,
        CtaComponent,
        TeamComponent,
        NavbarComponent,
        TopAssociationsSliderComponent
    ],
    templateUrl: './index.component.html',
    styleUrl: './index.component.scss'
})
export class IndexComponent {
    activeSection: string = 'home';

  @HostListener('window:scroll', ['$event'])

  onWindowScroll() {
    const sections = document.querySelectorAll('.section');
    
    let currentSection: string = 'home';

    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop <= 100) { 
        currentSection = section.id;
      }
    });
    
    this.activeSection = currentSection;
  }

}
