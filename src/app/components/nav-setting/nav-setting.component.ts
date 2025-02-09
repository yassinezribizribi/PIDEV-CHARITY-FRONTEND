import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-nav-setting',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './nav-setting.component.html',
    styleUrl: './nav-setting.component.scss'
})
export class NavSettingComponent {

}
