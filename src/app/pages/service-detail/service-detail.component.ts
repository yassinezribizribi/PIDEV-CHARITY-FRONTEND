import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-service-detail',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        FaqComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './service-detail.component.html',
    styleUrl: './service-detail.component.scss'
})
export class ServiceDetailComponent {
  benefits = [
    'Deciding to purchase',
    'List your space',
    'Landing an experience or adventure',
    'Top uses questions',
  ]

  services = [
    'Breakfast Programme',
    'Food Assistance',
    'Social Media',
    'Social Works',
    'Digital Education',
    'School Programme',
  ]
}
