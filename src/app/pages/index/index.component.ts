import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { ServicesComponent } from '../../components/services/services.component';
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

@Component({
    selector: 'app-index',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        ServicesComponent,
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
        TeamComponent
    ],
    templateUrl: './index.component.html',
    styleUrl: './index.component.scss'
})
export class IndexComponent {

}
