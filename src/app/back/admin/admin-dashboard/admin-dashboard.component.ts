import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';  
import { AssociationService } from '../../../services/association.service';
import { CrisisService, Crisis } from '../../../services/crisis.service';
import { Association, AssociationStatus } from '../../../interfaces/association.interface';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertComponent } from './alert/alert.component';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService directly
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatDialogModule,
    FooterComponent,
    AdminNavbarComponent,
    AlertComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  associations: Association[] = [];
  crises: Crisis[] = [];
  selectedCrisis: Crisis | null = null;
  errorMessage: string | null = null;
  
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);

  constructor(
    private associationService: AssociationService,
    private crisisService: CrisisService
  ) {}

  ngOnInit() {
    this.loadAssociations();
    this.loadCrises();
  }

  loadCrises() {
    this.crisisService.getAllCrises().subscribe(
      (data) => {
        console.log("Crises data:", data); // <-- Vérification des données reçues

        this.crises = data;
        console.log(this.crises)
      },
      (error) => {
        console.error('Error fetching crises:', error);
      }
    );
  }

  deleteCrisis(id: number | undefined): void {
    if (id === undefined) {
      console.error("Crisis ID is missing!");
      return;
    }
  
    if (confirm("Are you sure you want to delete this crisis?")) {
      this.crisisService.deleteCrisis(id).subscribe(
        () => {
          console.log('Crisis with ID ${id} deleted successfully.');
          this.loadCrises(); // Recharge la liste après suppression
        },
        (error) => {
          console.error("Error deleting crisis:", error);
          alert("Failed to delete crisis. Check authentication and server.");
        }
      );
    }}
  

    openDialog(id: any,enterAnimationDuration: string, exitAnimationDuration: string): void {

      const dialogRef= this.dialog.open(AlertComponent, {
         width: '250px',
         enterAnimationDuration,
         exitAnimationDuration,
         data: { id }, 
       });
       dialogRef.afterClosed().subscribe(result => {
         console.log(result)
         if(result== 'no'|| result== undefined){
           return;
         }
           this.toastr.success('Crisis deleted !', 'successful!');
           this.loadCrises();
         
       });
     
   }

  loadAssociations() {
    this.associationService.getAllAssociations().pipe(
      tap((associations: Association[]) => this.associations = associations),
      catchError((error) => {
        console.error('Error fetching associations:', error);
        return of([]);
      })
    ).subscribe();
  }

  getVerifiedCount(): number {
    return this.associations.filter(a => a.status === AssociationStatus.APPROVED).length;
  }

  getPendingCount(): number {
    return this.associations.filter(a => a.status === AssociationStatus.PENDING).length;
  }

  getStatusBadgeClass(status: AssociationStatus): string {
    switch (status) {
      case AssociationStatus.APPROVED: return 'bg-success';
      case AssociationStatus.PENDING: return 'bg-warning';
      case AssociationStatus.REJECTED: return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
