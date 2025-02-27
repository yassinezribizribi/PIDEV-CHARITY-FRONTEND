import { ChangeDetectionStrategy, Component, Inject, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { AdminDashboardComponent } from '../admin-dashboard.component';
import { CrisisService } from 'src/app/services/crisis.service';
@Component({
  selector: 'app-alert',
  imports: [
    MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent
  ],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {

  constructor(    private crisisService: CrisisService,     @Inject(MAT_DIALOG_DATA) public data: { id: number } // ✅ Receive ID

  ){}

  readonly dialogRef = inject(MatDialogRef<AdminDashboardComponent>);
  deleteCrisis( result:any): void {
   
  
    
      this.crisisService.deleteCrisis(this.data.id).subscribe(
        () => {
          console.log(`Crisis with ID ${this.data.id} deleted successfully.`);
          //this.loadCrises(); // Recharge la liste après suppression
          this.closeDialog('ok')
        },
        (error) => {
          console.error("Error deleting crisis:", error);
          alert("Failed to delete crisis. Check authentication and server.");
          this.closeDialog('no')
        }
      );
    
  }
  closeDialog(result: string): void {
    this.dialogRef.close(result);
  }
}
