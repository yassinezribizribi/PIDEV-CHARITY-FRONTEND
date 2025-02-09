import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-forum',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './forum.component.html',
    styleUrl: './forum.component.scss'
})
export class ForumComponent {

}
