import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-comingsoon',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './comingsoon.component.html',
    styleUrl: './comingsoon.component.scss'
})
export class ComingsoonComponent {
  year:any

  countdownDate: Date = new Date('September 13, 2025 6:0:0');
  days: number = 0
  hours: number = 0
  minutes: number =0
  seconds: number = 0

  constructor() { }

  ngOnInit(): void {
    this.year = new Date().getFullYear()
    setInterval(() => {
      this.calculateTime();
    }, 1000);
  }

  calculateTime() {
    const now = new Date().getTime();
    const difference = this.countdownDate.getTime() - now;
    this.days = Math.floor(difference / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((difference % (1000 * 60)) / 1000);
  }

}
