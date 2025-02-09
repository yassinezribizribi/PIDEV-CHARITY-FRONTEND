import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import BlogData from '../../../data/blog.json'
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-blogs',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './blogs.component.html',
    styleUrl: './blogs.component.scss'
})
export class BlogsComponent {
  blogData = BlogData;
}
