import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  type OnInit,
} from '@angular/core'
import { postData } from '../../data'
import { CommonModule } from '@angular/common'
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser'

@Component({
    selector: 'posts',
    imports: [CommonModule],
    templateUrl: './posts.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PostsComponent implements OnInit {
  postData = postData

  public safePosts: any[] = []

  private sanitizer = inject(DomSanitizer)

  ngOnInit() {
    this.safePosts = this.postData.map((post) => ({
      ...post,
      safeLink: this.sanitizer.bypassSecurityTrustResourceUrl(post.link!),
    }))
  }
}
