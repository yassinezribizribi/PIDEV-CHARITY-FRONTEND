import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CountUpModule } from 'ngx-countup';

@Component({
    selector: 'app-about-one',
    imports: [
        CommonModule,
        RouterLink,
        CountUpModule
    ],
    templateUrl: './about-one.component.html',
    styleUrl: './about-one.component.scss'
})
export class AboutOneComponent {

}
