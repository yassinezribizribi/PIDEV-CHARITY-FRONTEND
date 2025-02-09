import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-about-two',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './about-two.component.html',
    styleUrl: './about-two.component.scss'
})
export class AboutTwoComponent {

}
