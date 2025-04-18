import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Crisis } from '../../services/crisis.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-crisis-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Crisis Details</h2>
    <mat-dialog-content>
      <p><strong>ID:</strong> {{ data.idCrisis }}</p>
      <p><strong>Category:</strong> {{ data.categorie }}</p>
      <p><strong>Description:</strong> {{ data.description }}</p>
      <p><strong>Location:</strong> {{ data.location }}</p>
      <p><strong>Latitude:</strong> {{ data.latitude }}</p>
      <p><strong>Longitude:</strong> {{ data.longitude }}</p>
      <p><strong>Date:</strong> {{ data.crisisDate | date }}</p>
      <p><strong>Status:</strong> {{ data.status }}</p>
      <p><strong>Severity:</strong> {{ data.severity }}</p>
      <p><strong>Reported by (User ID):</strong> {{ data.idUser }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `
})
export class CrisisDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Crisis) {}
}
