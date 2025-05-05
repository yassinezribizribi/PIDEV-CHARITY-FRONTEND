import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PredictionService } from '../../../services/prediction.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-resource-allocation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="card shadow-lg border-0 rounded-4">
      <div class="card-header bg-white border-0 pt-4 pb-3 px-4">
        <h4 class="mb-0">Resource Allocation Predictions</h4>
      </div>
      <div class="card-body p-4">
        <form [formGroup]="predictionForm" (ngSubmit)="getPredictions()">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Resource Type</label>
              <select class="form-select" formControlName="resourceType">
                <option value="food">Food</option>
                <option value="shelter">Shelter</option>
                <option value="medical">Medical Aid</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Region</label>
              <input type="text" class="form-control" formControlName="region" placeholder="Enter region">
            </div>
            <div class="col-md-4">
              <label class="form-label">Forecast Period (Days)</label>
              <input type="number" class="form-control" formControlName="periods" min="1" max="90">
            </div>
          </div>
          <div class="mt-4">
            <button type="submit" class="btn btn-primary" [disabled]="!predictionForm.valid">
              <i class="bi bi-graph-up me-2"></i>Generate Predictions
            </button>
          </div>
        </form>

        <!-- Prediction Results -->
        <div class="mt-4" *ngIf="forecast">
          <h5>Prediction Results</h5>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Predicted Need</th>
                  <th>Upper Bound</th>
                  <th>Lower Bound</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of forecast">
                  <td>{{ item.ds | date }}</td>
                  <td>{{ item.yhat | number:'1.0-0' }}</td>
                  <td>{{ item.yhat_upper | number:'1.0-0' }}</td>
                  <td>{{ item.yhat_lower | number:'1.0-0' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Error Message -->
        <div class="alert alert-danger mt-3" *ngIf="error">
          {{ error }}
        </div>
      </div>
    </div>
  `
})
export class ResourceAllocationComponent implements OnInit {
  predictionForm: FormGroup;
  forecast: any[] | null = null;
  error: string | null = null;

  constructor(
    private predictionService: PredictionService,
    private fb: FormBuilder
  ) {
    this.predictionForm = this.fb.group({
      resourceType: ['food', Validators.required],
      region: ['', Validators.required],
      periods: [14, [Validators.required, Validators.min(1), Validators.max(90)]]
    });
  }

  ngOnInit(): void {}

  getPredictions() {
    if (this.predictionForm.valid) {
      const { resourceType, region, periods } = this.predictionForm.value;
      
      this.predictionService.getResourceAllocationPrediction({
        resourceType,
        region,
        periods
      }).subscribe({
        next: (response: any) => {
          this.forecast = response.forecast;
          this.error = null;
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to generate predictions';
          this.forecast = null;
        }
      });
    }
  }
} 