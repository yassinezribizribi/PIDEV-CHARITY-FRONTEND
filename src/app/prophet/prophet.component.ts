import { Component } from '@angular/core';
import { PredictionService } from '../services/prediction.service';

@Component({
  selector: 'app-prophet',
  template: `
    <div>
      <h2>Prophet Forecast</h2>
      <input type="number" [(ngModel)]="periods" placeholder="Days to forecast">
      <button (click)="getForecast()">Forecast</button>
      
      <div *ngIf="forecast">
        <h3>Forecast Results:</h3>
        <div *ngFor="let item of forecast">
          Date: {{ item.ds | date }} | Prediction: {{ item.yhat | number }}
        </div>
      </div>
      
      <div *ngIf="error">{{ error }}</div>
    </div>
  `
})
export class ProphetComponent {
  periods = 14;
  forecast: any[] | null = null;
  error: string | null = null;

  constructor(private predictionService: PredictionService) {}

  getForecast() {
    this.predictionService.getProphetForecast(this.periods).subscribe({
      next: (response: any) => {
        this.forecast = response.forecast;
        this.error = null;
      },
      error: (err) => {
        this.error = err.error?.error || 'Forecast failed';
        this.forecast = null;
      }
    });
  }
}