import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-maintenance',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './maintenance.component.html',
    styleUrl: './maintenance.component.scss'
})
export class MaintenanceComponent {
  year:any

  minutes: number = 60;
  seconds: number = 0;
  interval: any;

  ngOnInit() {

    this.year = new Date().getFullYear();

    this.interval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  private updateTimer(): void {
    if (this.seconds > 0) {
      this.seconds--;
    } else if (this.minutes > 0) {
      this.minutes--;
      this.seconds = 59;
    } else {
      // Timer expired, you can add additional logic here
      clearInterval(this.interval);
    }
  }
}
