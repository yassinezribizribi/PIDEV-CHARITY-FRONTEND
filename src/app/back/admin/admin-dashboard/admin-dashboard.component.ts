import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AssociationService } from '../../../services/association.service';
import { Association } from '../../../interfaces/association.interface';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';  
import { CrisisService, Crisis } from '../../../services/crisis.service';
import {MatDialogModule} from '@angular/material/dialog';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { AlertComponent } from './alert/alert.component';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatDialogModule,
    FooterComponent,
    AdminNavbarComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  associations: Association[] = [];
  crises: Crisis[] = [];
  selectedCrisis: Crisis | null = null;  // Crise sélectionnée
  successMessage: string | null = null;  // Message de succès
  errorMessage: string | null = null;  // Message d'
  readonly dialog = inject(MatDialog);
  constructor(
    private crisisService: CrisisService,
    private associationService: AssociationService,
    private toastr: ToastrService
  ) {}
  

  ngOnInit() {
    // Load all associations
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
          console.log(`Crisis with ID ${id} deleted successfully.`);
          this.loadCrises(); // Recharge la liste après suppression
        },
        (error) => {
          console.error("Error deleting crisis:", error);
          alert("Failed to delete crisis. Check authentication and server.");
        }
      );
    }
  }

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
  /*
  updateCrisis() {
    if (!this.selectedCrisis || !this.selectedCrisis.id) {
      console.error('Aucune crise sélectionnée ou l\'ID est manquant');
      return;
    }
    const crisisId = this.selectedCrisis.id;
    const crisisData = {
      id: crisisId,
      category: this.selectedCrisis.category,
      location: this.selectedCrisis.location,
      description: this.selectedCrisis.description,
      crisis_date: this.selectedCrisis.crisis_date,
      updates: this.selectedCrisis.updates
    };
  
    // Appelle la méthode du service pour mettre à jour la crise
    this.crisisService.updateCrisis(crisisId, crisisData).subscribe(
      (response) => {
        console.log('Crisis updated successfully:', response);
        this.successMessage = 'Crisis updated successfully!';
        this.errorMessage = null;
        this.loadCrises();  // Recharge la liste des crises après mise à jour
      },
      (error) => {
        console.error('Error updating crisis:', error);
        this.errorMessage = `Error: ${error.status} ${error.statusText}`;
        this.successMessage = null;
        setTimeout(() => {
          this.errorMessage = null;
        }, 5000);  // Cache l'erreur après 5 secondes
      }
    );
  }
  

*/

  

  loadAssociations() {
    // For now, get from localStorage
    const associations: Association[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('association_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          associations.push(JSON.parse(stored));
        }
      }
    }
    this.associations = associations;
  }

  getVerifiedCount(): number {
    return this.associations.filter(a => a.verificationStatus === 'verified').length;
  }

  getPendingCount(): number {
    return this.associations.filter(a => a.verificationStatus === 'pending').length;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'verified': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
} 