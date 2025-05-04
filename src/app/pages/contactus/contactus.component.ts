import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-contactus',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        ContactComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './contactus.component.html',
    styleUrl: './contactus.component.scss'
})
export class ContactusComponent {

}