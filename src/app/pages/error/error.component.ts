import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-error',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './error.component.html',
    styleUrl: './error.component.scss'
})
export class ErrorComponent {
  year:any

  ngOnInit(): void {
    this.year = new Date().getFullYear()
  }
}
