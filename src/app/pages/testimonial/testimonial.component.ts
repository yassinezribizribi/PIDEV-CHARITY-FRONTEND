import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import ClientData from '../../../data/client.json'
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-testimonial',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './testimonial.component.html',
    styleUrl: './testimonial.component.scss'
})
export class TestimonialComponent {
  clientData = ClientData
}
