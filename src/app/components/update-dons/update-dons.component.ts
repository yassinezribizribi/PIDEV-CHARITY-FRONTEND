import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DonsService } from '../../services/dons.service';
import { Dons } from '../../models/dons.model';
import { DeliveryMethod } from '../../interfaces/dons.interface';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
@Component({
  selector: 'app-update-dons',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, NavbarComponent],
  templateUrl: './update-dons.component.html',
  styleUrls: ['./update-dons.component.scss']
})
export class UpdateDonsComponent implements OnInit {
  donsId: number | null = null;
  dons: Dons | null = null;
  loading: boolean = true;
  saving: boolean = false;
  error: string | null = null;
  success: boolean = false;
  
  deliveryMethods = Object.values(DeliveryMethod);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private donsService: DonsService
  ) {}

  ngOnInit(): void {
    this.donsId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.donsId) {
      this.loadDons();
    } else {
      this.error = 'Invalid donation ID';
      this.loading = false;
    }
  }

  loadDons(): void {
    this.loading = true;
    this.donsService.getUserDonsById(this.donsId!).subscribe({
      next: (dons) => {
        this.dons = dons;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading donation details. Please try again later.';
        this.loading = false;
        console.error('Error loading dons:', err);
      }
    });
  }

  updateDons(): void {
    if (!this.dons || !this.donsId) return;
    
    this.saving = true;
    this.donsService.updateUserDons(this.donsId, this.dons).subscribe({
      next: (updatedDons) => {
        this.dons = updatedDons;
        this.success = true;
        this.saving = false;
        
        // Redirect back to user-dons page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/user-dons']);
        }, 2000);
      },
      error: (err) => {
        this.error = 'Error updating donation. Please try again.';
        this.saving = false;
        console.error('Error updating dons:', err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/user-dons']);
  }
} 