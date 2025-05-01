import { Component } from '@angular/core';
import { PredictionService } from '../services/prediction.service';

@Component({
  selector: 'app-lstm',
  template: `
    <div>
      <h2>LSTM Prediction</h2>
      <button (click)="makePrediction()">Predict</button>
      <div *ngIf="prediction">Result: {{ prediction }}</div>
      <div *ngIf="error">{{ error }}</div>
    </div>
  `
})
export class LstmComponent {
  prediction: number | null = null;
  error: string | null = null;

  constructor(private predictionService: PredictionService) {}

  makePrediction() {
    // Example input data (modify with your actual data structure)
    const inputData = [
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6],
      [0.7, 0.8, 0.9]
    ];

    this.predictionService.predictWithLSTM(inputData).subscribe({
      next: (response: any) => {
        this.prediction = response.prediction;
        this.error = null;
      },
      error: (err) => {
        this.error = err.error?.error || 'Prediction failed';
        this.prediction = null;
      }
    });
  }
}