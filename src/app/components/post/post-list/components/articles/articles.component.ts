import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { articleData } from '../../data'
import { CommonModule, DatePipe } from '@angular/common'
import { currentYear } from '@common/constants'

@Component({
    selector: 'post-articles',
    imports: [CommonModule, DatePipe],
    templateUrl: './articles.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ArticlesComponent {
  articles = articleData
  currentYear = currentYear
}
