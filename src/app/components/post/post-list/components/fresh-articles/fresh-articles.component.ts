import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { currentYear } from '@common/constants'

@Component({
    selector: 'post-fresh-articles',
    imports: [],
    templateUrl: './fresh-articles.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FreshArticlesComponent {
  currentYear = currentYear
}
