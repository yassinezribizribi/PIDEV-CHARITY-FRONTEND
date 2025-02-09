import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-privacy',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './privacy.component.html',
    styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {
  privacyData = [
    "Digital Marketing Solutions for Tomorrow",
    "Our Talented & Experienced Marketing Agency",
    "Create your own skin to match your brand",
    "Digital Marketing Solutions for Tomorrow",
    "Our Talented & Experienced Marketing Agency",
    "Create your own skin to match your brand",
  ]
}
