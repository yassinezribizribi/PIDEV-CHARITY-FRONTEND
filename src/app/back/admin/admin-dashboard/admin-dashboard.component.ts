import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CrisisService, Crisis } from '../../../services/crisis.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { CrisisDetailDialogComponent } from '@component/crisis-detail-dialog/crisis-detail-dialog.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatDialogModule,
    AdminNavbarComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  crises: Crisis[] = [];
  readonly dialog = inject(MatDialog);

  constructor(
    private crisisService: CrisisService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadCrises();
  }

  loadCrises() {
    this.crisisService.getAllCrises().subscribe(
      (data) => {
        this.crises = data;
      },
      (error) => {
        console.error('Error fetching crises:', error);
      }
    );
  }

  deleteCrisis(id: number | undefined): void {
    if (!id) return;

    if (confirm("Are you sure you want to delete this crisis?")) {
      this.crisisService.deleteCrisis(id).subscribe(
        () => {
          this.toastr.success('Crisis deleted successfully!', 'Success');
          this.loadCrises();
        },
        (error) => {
          console.error("Error deleting crisis:", error);
          this.toastr.error('Failed to delete crisis.', 'Error');
        }
      );
    }
  }

  updateCrisis(crisis: Crisis): void {
    const newDescription = prompt("Update the crisis description:", crisis.description);
    if (newDescription !== null && newDescription !== crisis.description) {
      const updatedCrisis = { ...crisis, description: newDescription };

      this.crisisService.updateCrisis(crisis.idCrisis || 0, updatedCrisis).subscribe(
        () => {
          this.toastr.success('Crisis updated successfully!', 'Success');
          this.loadCrises();
        },
        (error) => {
          console.error('Update error:', error);
          this.toastr.error('Failed to update crisis.', 'Error');
        }
      );
    }
  }
  viewDetails(crisis: Crisis): void {
    this.dialog.open(CrisisDetailDialogComponent, {
      data: crisis,
      width: '400px'
    });
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'LOW':
        return 'badge bg-success text-white';
      case 'MODERATE':
        return 'badge bg-warning text-dark';
      case 'HIGH':
        return 'badge bg-danger text-white';
      case 'CRITICAL':
        return 'badge bg-dark text-white';
      default:
        return 'badge bg-secondary text-white';
    }
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'LOW':
        return 'bi-check-circle-fill';
      case 'MODERATE':
        return 'bi-exclamation-triangle-fill';
      case 'HIGH':
        return 'bi-x-circle-fill';
      case 'CRITICAL':
        return 'bi-fire';
      default:
        return 'bi-question-circle-fill';
    }
  }
}
