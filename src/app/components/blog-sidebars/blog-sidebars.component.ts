import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-blog-sidebars',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './blog-sidebars.component.html',
    styleUrl: './blog-sidebars.component.scss'
})
export class BlogSidebarsComponent {
  recentPost = [
    {
      image:'assets/images/blog/1.jpg',
      title:'Consultant Business',
      date:'13th March 2024'
    },
    {
      image:'assets/images/blog/2.jpg',
      title:'Grow Your Business',
      date:'5th May 2024'
    },
    {
      image:'assets/images/blog/3.jpg',
      title:'Look On The Glorious Balance',
      date:'19th June 2024'
    },
  ]

  tagCloud = [
    'Business','Finance','Marketing','Fashion','Bride','Lifestyle','Travel','Beauty','Video','Audio'
  ]
}
