import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { commentsData } from '../../data'
import { CommonModule, DatePipe } from '@angular/common'
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'

@Component({
    selector: 'blog-comment',
    imports: [CommonModule, DatePipe, NgbTooltipModule],
    templateUrl: './blog-comment.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BlogCommentComponent {
  commentsData = commentsData
}
