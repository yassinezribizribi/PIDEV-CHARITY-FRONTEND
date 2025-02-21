import { Component } from '@angular/core'
import { PageTitleComponent } from '@component/page-title.component'
import { PostsComponent } from './components/posts/posts.component'
import { FreshArticlesComponent } from './components/fresh-articles/fresh-articles.component'
import { ArticlesComponent } from './components/articles/articles.component'

@Component({
    selector: 'app-post-list',
    imports: [
        PageTitleComponent,
        PostsComponent,
        FreshArticlesComponent,
        ArticlesComponent,
    ],
    templateUrl: './post-list.component.html',
    styles: ``
})
export class PostListComponent {}
