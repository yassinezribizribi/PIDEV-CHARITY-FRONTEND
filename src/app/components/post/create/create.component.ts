import { Component } from '@angular/core'
import { FileUploaderComponent } from '@component/file-uploader/file-uploader.component'
import { PageTitleComponent } from '@component/page-title.component'
import { BlogInfoComponent } from './components/blog-info/blog-info.component'
import { BlogUserInfoComponent } from './components/blog-user-info/blog-user-info.component'
import { BlogCardComponent } from './components/blog-card/blog-card.component'

@Component({
    selector: 'app-create',
    imports: [
        PageTitleComponent,
        FileUploaderComponent,
        BlogInfoComponent,
        BlogUserInfoComponent,
        BlogCardComponent,
    ],
    templateUrl: './create.component.html',
    styles: ``
})
export class CreateComponent {}
