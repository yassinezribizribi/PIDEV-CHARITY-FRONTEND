import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

import BlogData from '../../../data/blog.json'
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-blog-sidebar',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        BlogSidebarsComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './blog-sidebar.component.html',
    styleUrl: './blog-sidebar.component.scss'
})
export class BlogSidebarComponent {
  blogData = BlogData;
}
