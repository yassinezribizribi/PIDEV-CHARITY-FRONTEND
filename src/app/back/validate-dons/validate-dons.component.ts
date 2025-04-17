import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DonsService } from '../../services/dons.service';
import { Dons } from '../../models/dons.model';
import { AdminNavbarComponent } from '../admin/admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-validate-dons',
  standalone: true,
  imports: [CommonModule, AdminNavbarComponent],
  templateUrl: './validate-dons.component.html',
  styleUrls: ['./validate-dons.component.scss']
})
export class ValidateDonsComponent implements OnInit {
  donationId: number = 0;
  dons: Dons[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private donsService: DonsService
  ) {}

  ngOnInit() {
    this.donationId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDons();
  }

  loadDons() {
    this.loading = true;
    this.donsService.getDonsByDonationId(this.donationId).subscribe({
      next: (dons) => {
        this.dons = dons;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dons';
        this.loading = false;
        console.error('Error loading dons:', err);
      }
    });
  }

  validateDon(idDons: number) {
    this.donsService.validateDonsByAssociation(idDons).subscribe({
      next: () => {
        // Refresh the list after validation
        this.loadDons();
      },
      error: (err) => {
        this.error = 'Failed to validate don';
        console.error('Error validating don:', err);
      }
    });
  }
}
