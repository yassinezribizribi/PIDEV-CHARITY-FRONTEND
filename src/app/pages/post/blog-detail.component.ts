import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import BlogData from '../../../data/blog.json'
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-blog-detail',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        BlogSidebarsComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './blog-detail.component.html',
    styleUrl: './blog-detail.component.scss'
})


export class BlogDetailComponent {

  blogData = BlogData
  id:any 
  data:any

  constructor(private route:ActivatedRoute){
    this.id = route.snapshot.params['id']
    this.data = this.blogData.find((item)=>item.id === parseInt(this.id))
  }
}
