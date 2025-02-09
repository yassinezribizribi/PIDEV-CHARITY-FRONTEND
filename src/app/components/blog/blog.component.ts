import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import BlogData from '../../../data/blog.json'

@Component({
    selector: 'app-blog',
    imports: [
        CommonModule,
        RouterLink,
    ],
    templateUrl: './blog.component.html',
    styleUrl: './blog.component.scss'
})
export class BlogComponent {
  blogData = BlogData
}
