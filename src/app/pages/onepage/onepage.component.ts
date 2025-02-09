import { CommonModule } from '@angular/common';
import { Component, HostListener  } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SingleNavbarComponent } from '../../components/single-navbar/single-navbar.component';
import { ServicesComponent } from '../../components/services/services.component';
import { AboutOneComponent } from '../../components/about-one/about-one.component';
import { AboutTwoComponent } from '../../components/about-two/about-two.component';
import { ForumComponent } from '../../components/forum/forum.component';
import { ClientComponent } from '../../components/client/client.component';
import { BlogComponent } from '../../components/blog/blog.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { HomeBannerComponent } from "../../components/home-banner/home-banner.component";
import { MakeDonationComponent } from "../../components/make-donation/make-donation.component";
import { CausesComponent } from "../../components/causes/causes.component";
import { CtaComponent } from "../../components/cta/cta.component";
import { TeamComponent } from "../../components/team/team.component";

@Component({
    selector: 'app-onepage',
    imports: [
        CommonModule,
        RouterLink,
        SingleNavbarComponent,
        ServicesComponent,
        AboutOneComponent,
        AboutTwoComponent,
        ForumComponent,
        ClientComponent,
        BlogComponent,
        ContactComponent,
        FooterComponent,
        ScrollToTopComponent,
        HomeBannerComponent,
        MakeDonationComponent,
        CausesComponent,
        CtaComponent,
        TeamComponent
    ],
    templateUrl: './onepage.component.html',
    styleUrl: './onepage.component.scss'
})
export class OnepageComponent {

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
