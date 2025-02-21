import type { Route } from '@angular/router'
import { PostListComponent } from './post-list/post-list.component'
import { DetailsComponent } from './details/details.component'
import { CreateComponent } from './create/create.component'

export const POST_ROUTES: Route[] = [
  { path: '', component: PostListComponent, data: { title: 'Blog Grid' } },
  {
    path: 'details',
    component: DetailsComponent,
    data: { title: 'Blog Details' },
  },
  {
    path: 'create',
    component: CreateComponent,
    data: { title: 'Blog Create' },
  },
]
