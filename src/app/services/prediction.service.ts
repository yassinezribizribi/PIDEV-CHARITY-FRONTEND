import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {

  constructor(private http: HttpClient) { }

  // Spring Boot API Call
  getSpringData(data: any) {
    return this.http.post(
      `${environment.apiUrl}/spring/data`,
      data
    );
  }

  // Flask LSTM Prediction
  predictWithLSTM(inputData: number[][]) {
    return this.http.post(
      `${environment.flaskApiUrl}/flask/predict/lstm`,
      { input: inputData }
    );
  }

  // Flask Prophet Forecast
  getProphetForecast(periods: number = 14) {
    return this.http.post(
      `${environment.flaskApiUrl}/flask/predict/prophet`,
      { periods }
    );
  }

  // Resource Allocation Prediction
  getResourceAllocationPrediction(data: {
    resourceType: string;
    region: string;
    periods: number;
  }): Observable<any> {
    // First, get historical data for the resource type and region
    return this.http.post(
      `${environment.flaskApiUrl}/flask/predict/resource-allocation`,
      {
        resourceType: data.resourceType,
        region: data.region,
        periods: data.periods,
        includeUpperLower: true,
        confidenceInterval: 0.95
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Prediction service error:', error);
        
        // If the Flask server is not available, return mock data
        if (error.status === 0 || error.status === 404) {
          console.warn('Flask server not available, returning mock data');
          return of(this.generateMockPredictions(data));
        }
        
        return throwError(() => new Error('Failed to generate predictions. Please try again later.'));
      })
    );
  }

  // Generate mock predictions for development/testing
  private generateMockPredictions(data: {
    resourceType: string;
    region: string;
    periods: number;
  }): any {
    const today = new Date();
    const forecast = [];

    for (let i = 0; i < data.periods; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Generate random values based on resource type
      let baseValue = 0;
      switch (data.resourceType) {
        case 'food':
          baseValue = 1000;
          break;
        case 'shelter':
          baseValue = 500;
          break;
        case 'medical':
          baseValue = 200;
          break;
        default:
          baseValue = 100;
      }

      // Add some randomness
      const randomFactor = 0.2; // 20% variation
      const value = baseValue * (1 + (Math.random() * 2 - 1) * randomFactor);
      const upper = value * 1.2;
      const lower = value * 0.8;

      forecast.push({
        ds: date.toISOString().split('T')[0],
        yhat: Math.round(value),
        yhat_upper: Math.round(upper),
        yhat_lower: Math.round(lower)
      });
    }

    return { forecast };
  }
}