import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { PageTitleComponent } from '@component/page-title.component'
import { BlogCommentComponent } from './components/blog-comment/blog-comment.component'
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component'
import { BlogPhotosComponent } from './components/blog-photos/blog-photos.component'
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { currentYear } from '@common/constants'

@Component({
    selector: 'app-details',
    imports: [
        PageTitleComponent,
        BlogCommentComponent,
        BlogDetailComponent,
        BlogPhotosComponent,
        NgbDropdownModule,
    ],
    templateUrl: './details.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DetailsComponent {
  currentYear = currentYear
}
