import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { currentYear } from '@common/constants'

@Component({
    selector: 'blog-card',
    imports: [],
    templateUrl: './blog-card.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BlogCardComponent {
  currentYear = currentYear
}
