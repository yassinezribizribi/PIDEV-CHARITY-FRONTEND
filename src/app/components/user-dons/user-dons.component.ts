import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DonsService } from '../../services/dons.service';
import { Dons } from '../../models/dons.model';
import { Router } from '@angular/router';
import { DeliveryMethod } from '../../interfaces/dons.interface';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Page } from '../../models/page.model';
declare var bootstrap: any;

@Component({
  selector: 'app-user-dons',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, NavbarComponent],
  templateUrl: './user-dons.component.html',
  styleUrls: ['./user-dons.component.scss']
})
export class UserDonsComponent implements OnInit {
  Math = Math;
  userDons: Dons[] = [];
  filteredDons: Dons[] = [];
  loading: boolean = true;
  error: string | null = null;
  selectedDon: Dons | null = null;
  
  // Filter properties
  searchTerm: string = '';
  searchId: string = '';
  statusFilter: string = '';
  deliveryFilter: string = '';
  dateFilter: string = '';
  
  // Pagination properties
  currentPage: number = 0; // Changed to 0-based for backend pagination
  itemsPerPage: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  
  private detailsModal: any;

  constructor(
    private donsService: DonsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserDons();
    // Initialize Bootstrap modal
    this.detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
  }

  refreshData(): void {
    this.loadUserDons();
  }

  loadUserDons(): void {
    this.loading = true;
    this.donsService.getUserDons(this.currentPage, this.itemsPerPage).subscribe({
      next: (page) => {
        this.userDons = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading your donations. Please try again later.';
        this.loading = false;
        console.error('Error loading user dons:', err);
      }
    });
  }

  applyFilters(): void {
    this.filteredDons = this.userDons.filter(don => {
      // ID search filter
      const idMatch = !this.searchId || 
        (don.idDons && don.idDons.toString().includes(this.searchId));
      
      // Search filter
      const searchMatch = !this.searchTerm || 
        (don.nomDoneur && don.nomDoneur.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (don.prenomDoneur && don.prenomDoneur.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (don.donorEmail && don.donorEmail.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      // Status filter
      const statusMatch = !this.statusFilter || 
        (this.statusFilter === 'true' && don.associationValidated) ||
        (this.statusFilter === 'false' && !don.associationValidated);
      
      // Delivery method filter
      const deliveryMatch = !this.deliveryFilter || 
        don.deliveryMethod === this.deliveryFilter;
      
      // Date filter
      let dateMatch = true;
      if (this.dateFilter && don.donationDate) {
        const donationDate = new Date(don.donationDate);
        const today = new Date();
        
        switch (this.dateFilter) {
          case 'today':
            dateMatch = donationDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(today.setDate(today.getDate() - 7));
            dateMatch = donationDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
            dateMatch = donationDate >= monthAgo;
            break;
          case 'year':
            const yearAgo = new Date(today.setFullYear(today.getFullYear() - 1));
            dateMatch = donationDate >= yearAgo;
            break;
        }
      }
      
      return idMatch && searchMatch && statusMatch && deliveryMatch && dateMatch;
    });
  }

  // Pagination methods
  get paginatedDonations(): Dons[] {
    return this.filteredDons;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUserDons();
    }
  }

  clearSearchField(): void {
    this.searchId = '';
    this.applyFilters();
  }

  deleteDon(donsId: number | undefined): void {
    if (!donsId) return;
    
    if (confirm('Are you sure you want to delete this donation?')) {
      this.donsService.deleteUserDons(donsId).subscribe({
        next: () => {
          this.userDons = this.userDons.filter(don => don.idDons !== donsId);
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error deleting donation:', err);
          alert('Error deleting donation. Please try again.');
        }
      });
    }
  }

  editDon(donsId: number | undefined): void {
    if (!donsId) return;
    this.router.navigate(['/update-dons', donsId]);
  }

  viewDetails(don: Dons): void {
    this.selectedDon = don;
    this.detailsModal.show();
  }

  getStatusClass(isValidated: boolean): string {
    return isValidated ? 'status-approved' : 'status-pending';
  }

  getDeliveryMethodClass(method: DeliveryMethod): string {
    switch (method) {
      case DeliveryMethod.DROP_OFF:
        return 'delivery-drop-off';
      case DeliveryMethod.PICK_UP:
        return 'delivery-pick-up';
      default:
        return 'delivery-unknown';
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }
}
