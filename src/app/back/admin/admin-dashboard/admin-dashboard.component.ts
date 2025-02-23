import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AssociationService } from '../../../services/association.service';
import { Association } from '../../../interfaces/association.interface';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';  
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
   
    FooterComponent,
    AdminNavbarComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  associations: Association[] = [];

  constructor(private associationService: AssociationService) {}

  ngOnInit() {
    // Load all associations
    this.loadAssociations();
  }

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