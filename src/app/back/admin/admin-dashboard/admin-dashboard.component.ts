import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CrisisService, Crisis, CrisisStatus } from '../../../services/crisis.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { CrisisDetailDialogComponent } from '@component/crisis-detail-dialog/crisis-detail-dialog.component';
import { FormsModule } from '@angular/forms';
import { RequestService } from 'src/app/services/request.service';
import { Request as MyRequest } from 'src/app/models/Request.model';
import { ResponseService } from 'src/app/services/response.service';
import { Response } from 'src/app/models/Response.model';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatDialogModule,
    AdminNavbarComponent,
    FormsModule,
    MatIconModule

  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  requests: MyRequest[] = [];
  filteredRequests: MyRequest[] = [];
  crises: Crisis[] = [];
  filteredCrises: Crisis[] = [];
  searchCrisisTerm: string = '';
  searchRequestTerm: string = '';
  CrisisStatus = CrisisStatus; // Make enum available in template

  readonly dialog = inject(MatDialog);

  constructor(
    private crisisService: CrisisService,
    private toastr: ToastrService,
    private requestService: RequestService,
    private responseService: ResponseService
  ) {}

  ngOnInit(): void {
    this.loadCrises();
    this.loadRequests();
  }

  loadCrises(): void {
    this.crisisService.getAllCrises().subscribe({
      next: (data) => {
        console.log(data)
        this.crises = data;
        this.filteredCrises = [...data];
      },
      error: (err) => {
        console.error('Error fetching crises:', err);
        this.toastr.error('Error loading crises', 'Error');
      }
    });
  }

  loadRequests(): void {
    this.requestService.getAllRequestsWithResponses().subscribe(
      (requests) => {
        this.requests = requests;
        this.filteredRequests = [...requests];
      },
      (error) => {
        console.error('Error loading requests:', error);
      }
    );
  }

  getCrisisCountByStatus(status: CrisisStatus): number {
    return this.crises.filter(c => c.status === status).length;
  }

  filterCrises(): void {
    if (!this.searchCrisisTerm) {
      this.filteredCrises = [...this.crises];
      return;
    }
    
    const term = this.searchCrisisTerm.toLowerCase();
    this.filteredCrises = this.crises.filter(crisis => 
      (crisis.categorie?.toLowerCase().includes(term)) ||
      (crisis.location?.toLowerCase().includes(term)) ||
      (crisis.description?.toLowerCase().includes(term)) ||
      (crisis.severity?.toLowerCase().includes(term)) ||
      (crisis.status?.toLowerCase().includes(term))
    );
  }

  filterRequests(): void {
    if (!this.searchRequestTerm) {
      this.filteredRequests = [...this.requests];
      return;
    }
    
    const term = this.searchRequestTerm.toLowerCase();
    this.filteredRequests = this.requests.filter(request => 
      request.object.toLowerCase().includes(term) ||
      request.content.toLowerCase().includes(term)
    );
  }

  deleteCrisis(id?: number): void {
    if (!id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: "To delete the Crisis!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.crisisService.deleteCrisis(id).subscribe({
          next: () => {
            this.toastr.success('Crisis deleted successfully!', 'Success');
            this.loadCrises();
          },
          error: (err) => {
            console.error('Error deleting crisis:', err);
            this.toastr.error('Failed to delete crisis.', 'Error');
          }
        });
      }
    });
  }

  async updateCrisis(crisis: Crisis): Promise<void> {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Crisis',
      html:
        `<div class="mb-3">
          <label class="form-label">Description</label>
          <textarea id="description" class="form-control">${crisis.description}</textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">Severity</label>
          <select id="severity" class="form-select">
            <option value="LOW" ${crisis.severity === 'LOW' ? 'selected' : ''}>LOW</option>
            <option value="MEDIUM" ${crisis.severity === 'MEDIUM' ? 'selected' : ''}>MEDIUM</option>
            <option value="HIGH" ${crisis.severity === 'HIGH' ? 'selected' : ''}>HIGH</option>
          </select>
        </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: () => {
        return {
          description: (document.getElementById('description') as HTMLInputElement).value,
          severity: (document.getElementById('severity') as HTMLSelectElement).value
        };
      }
    });

    if (formValues) {
      const updatedCrisis = {
        ...crisis,
        description: formValues.description,
        severity: formValues.severity
      };

      this.crisisService.updateCrisis(crisis.idCrisis!, updatedCrisis).subscribe({
        next: () => {
          this.toastr.success('Crisis updated successfully', 'Success');
          this.loadCrises();
        },
        error: (err) => {
          console.error('Update error:', err);
          this.toastr.error('Failed to update crisis', 'Error');
        }
      });
    }
  }

  updateStatus(crisis: Crisis): void {
    let newStatus: CrisisStatus;
    
    switch (crisis.status) {
      case CrisisStatus.RESOLVED:
        newStatus = CrisisStatus.PENDING;
        break;
      case CrisisStatus.PENDING:
        newStatus = CrisisStatus.IN_PROGRESS;
        break;
      case CrisisStatus.IN_PROGRESS:
        newStatus = CrisisStatus.RESOLVED;
        break;
      default:
        newStatus = CrisisStatus.PENDING;
    }

    // Optimistic update
    const index = this.crises.findIndex(c => c.idCrisis === crisis.idCrisis);
    if (index !== -1) {
      this.crises[index].status = newStatus;
      this.filterCrises();
    }

    this.crisisService.updateCrisisStatus(crisis.idCrisis!, newStatus).subscribe({
      next: () => {
        this.toastr.success(`Status updated to ${newStatus}`, 'Success');
      },
      error: (err) => {
        console.error('Status update error:', err);
        this.toastr.error('Failed to update status', 'Error');
        // Revert on error
        if (index !== -1) {
          this.crises[index].status = crisis.status;
          this.filterCrises();
        }
      }
    });
  }
  
  viewDetails(crisis: Crisis): void {
    this.dialog.open(CrisisDetailDialogComponent, {
      data: crisis,
      width: '600px'
    });
  }

  viewRequestDetails(request: MyRequest): void {
    // Implement request detail view as needed
  }

  exportCrisesToCSV(): void {
    // Implement CSV export functionality
    this.toastr.info('Export functionality coming soon!', 'Info');
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'LOW': return 'badge bg-success';
      case 'MEDIUM': return 'badge bg-warning text-dark';
      case 'HIGH': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'LOW': return 'bi-check-circle';
      case 'MEDIUM': return 'bi-exclamation-triangle';
      case 'HIGH': return 'bi-exclamation-octagon';
      default: return 'bi-question-circle';
    }
  }

  getStatusClass(status: CrisisStatus): string {
    switch (status) {
      case CrisisStatus.PENDING: return 'badge bg-warning text-dark';
      case CrisisStatus.IN_PROGRESS: return 'badge bg-info text-white';
      case CrisisStatus.RESOLVED: return 'badge bg-success text-white';
      default: return 'badge bg-secondary';
    }
  }

  getStatusIcon(status: CrisisStatus): string {
    switch (status) {
      case CrisisStatus.PENDING: return 'bi-hourglass';
      case CrisisStatus.IN_PROGRESS: return 'bi-gear';
      case CrisisStatus.RESOLVED: return 'bi-check-circle';
      default: return 'bi-question-circle';
    }
  }

  getCategoryIcon(category?: string): string {
    if (!category) return 'bi-tag';
    
    switch (category.toLowerCase()) {
      case 'natural': return 'bi-tree';
      case 'medical': return 'bi-heart-pulse';
      case 'conflict': return 'bi-shield-exclamation';
      case 'economic': return 'bi-cash-stack';
      default: return 'bi-tag';
    }
  }

  assignToNearestAssociation(crisis: Crisis): void {
    if (!crisis.idCrisis) {
      this.toastr.warning('Invalid crisis ID');
      return;
    }
  
    this.crisisService.assignCrisisToNearestAssociation(crisis.idCrisis).subscribe({
      next: () => {
        this.toastr.success('Crisis successfully assigned to the nearest approved association.');
        this.loadCrises(); // Refresh list
      },
      error: (err) => {
        console.error('Error assigning crisis:', err);
        if (err.status === 404) {
          this.toastr.error('Crisis not found.');
        } else if (err.status === 400) {
          this.toastr.warning(err.error); // Display backend message (e.g., no association found)
        } else {
          this.toastr.error('Unexpected error assigning crisis.');
        }
      }
    });
  }
  
  
}