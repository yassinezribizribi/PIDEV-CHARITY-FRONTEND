import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-terms',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        FaqComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './terms.component.html',
    styleUrl: './terms.component.scss'
})
export class TermsComponent {
  restrictions = [
    'Digital Marketing Solutions for Tomorrow',
    'Our Talented & Experienced Marketing Agency',
    'Create your own skin to match your brand',
    'Digital Marketing Solutions for Tomorrow',
    'Our Talented & Experienced Marketing Agency',
    'Create your own skin to match your brand',
  ]
}
