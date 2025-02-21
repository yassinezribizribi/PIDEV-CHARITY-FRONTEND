import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { blogData } from '../../data'
import { DatePipe } from '@angular/common'

@Component({
    selector: 'blog-detail',
    imports: [DatePipe],
    templateUrl: './blog-detail.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BlogDetailComponent {
  blogData = blogData
}
