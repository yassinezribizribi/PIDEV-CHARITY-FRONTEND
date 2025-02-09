import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-lock-screen',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './lock-screen.component.html',
    styleUrl: './lock-screen.component.scss'
})
export class LockScreenComponent {

}
