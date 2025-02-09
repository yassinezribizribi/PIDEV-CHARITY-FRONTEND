import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-faqs',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        FaqComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './faqs.component.html',
    styleUrl: './faqs.component.scss'
})
export class FaqsComponent {

}
