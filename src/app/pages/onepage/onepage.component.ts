import { CommonModule } from '@angular/common';
import { Component, HostListener  } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SingleNavbarComponent } from '../../components/single-navbar/single-navbar.component';
import { HealthcareComponent } from '../../pages/Healthcare/healthcare.component';
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
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { TopAssociationsSliderComponent } from '../../components/top-associations-slider/top-associations-slider.component';
@Component({
    selector: 'onepage',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        SingleNavbarComponent,
        HealthcareComponent,
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
        TeamComponent,
        NavbarComponent,
        TopAssociationsSliderComponent
    ],
    templateUrl: './onepage.component.html',
    styleUrl: './onepage.component.scss'
})
export class OnepageComponent {


}
