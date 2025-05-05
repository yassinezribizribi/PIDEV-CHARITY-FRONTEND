import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DonsService } from '../../services/dons.service';
import { Dons } from '../../models/dons.model';
import { AdminNavbarComponent } from '../admin/admin-navbar/admin-navbar.component';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { Html5Qrcode } from 'html5-qrcode';
import { ToastrService } from 'ngx-toastr';
import { Page } from '../../models/page.model';

@Component({
  selector: 'app-validate-dons',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  templateUrl: './validate-dons.component.html',
  styleUrls: ['./validate-dons.component.scss']
})
export class ValidateDonsComponent implements OnInit, AfterViewInit {
  donationId: number = 0;
  dons: Dons[] = [];
  loading = true;
  error: string | null = null;

  // Search properties
  searchId: number | null = null;
  searchStatus: string = '';
  searchDeliveryMethod: string = '';
  showAdvancedSearch = false;

  // Sorting
  currentSortField = 'idDons';
  sortDirection = 'asc';

  // Delivery methods
  deliveryMethods: string[] = ['Pickup', 'Delivery', 'Drop-off'];

  // Pagination properties
  currentPage: number = 0;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  paginatedDonations: Dons[] = [];

  selectedType: string = '';

  Math = Math;

  @ViewChild('sortDropdown') sortDropdown!: ElementRef;
  private dropdownInstance: bootstrap.Dropdown | null = null;

  selectedDon: Dons | null = null;
  showDonDetails = false;

  scannerVisible = false;
  html5QrCode: Html5Qrcode | null = null;
  validationMessage: string | null = null;
  isSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private donsService: DonsService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.donationId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDons();
  }

  ngAfterViewInit() {
    if (this.sortDropdown) {
      this.dropdownInstance = new bootstrap.Dropdown(this.sortDropdown.nativeElement);
    }
  }

  // Computed properties for statistics
  get totalDonations(): number {
    return this.totalElements;
  }

  get pendingDonations(): number {
    return this.dons?.filter(d => !d.associationValidated)?.length || 0;
  }

  get validatedDonations(): number {
    return this.dons?.filter(d => d.associationValidated)?.length || 0;
  }

  changePage(page: number): void {
    console.log('Changing to page:', page);
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadDons();
    } else {
      console.log('Invalid page number:', page, 'Total pages:', this.totalPages);
    }
  }

  getPageNumbers(): number[] {
    console.log('Getting page numbers. Total pages:', this.totalPages);
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  loadDons() {
    this.loading = true;
    this.error = null;

    console.log('Loading page:', this.currentPage, 'with size:', this.itemsPerPage);
    
    this.donsService.getDonsByAssociation(this.currentPage, this.itemsPerPage).subscribe({
      next: (page) => {
        console.log('Received page data:', {
          content: page.content,
          totalPages: page.totalPages,
          totalElements: page.totalElements,
          currentPage: this.currentPage
        });
        
        this.dons = page.content;
        this.paginatedDonations = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading donations:', err);
        this.error = 'Failed to load donations';
        this.loading = false;
      }
    });
  }

  // Filter dons based on search criteria
  filterDons() {
    this.dons = this.dons.filter(don => {
      const matchesId = this.searchId 
        ? don.idDons?.toString().includes(this.searchId.toString()) 
        : true;
      
      const matchesStatus = this.searchStatus !== '' 
        ? don.associationValidated === (this.searchStatus === 'true') 
        : true;
      
      const matchesDeliveryMethod = this.searchDeliveryMethod 
        ? don.deliveryMethod === this.searchDeliveryMethod 
        : true;

      return matchesId && matchesStatus && matchesDeliveryMethod;
    });

    this.sortDons(this.currentSortField);
    this.currentPage = 1; // Reset to first page when filtering
  }

  // Reset all search filters
  resetSearch() {
    this.searchId = null;
    this.searchStatus = '';
    this.searchDeliveryMethod = '';
    this.error = null;
    this.dons = [...this.dons];
    this.sortDons(this.currentSortField);
  }

  // Clear just the search ID field
  clearSearchField() {
    this.searchId = null;
    this.filterDons();
  }

  // Apply advanced search filters
  applyAdvancedSearch() {
    this.filterDons();
  }

  // Sort dons by field
  sortDons(field: string) {
    if (field.startsWith('-')) {
      this.currentSortField = field.substring(1);
      this.sortDirection = 'desc';
    } else {
      this.currentSortField = field;
      this.sortDirection = 'asc';
    }

    this.dons.sort((a, b) => {
      let valueA = a[this.currentSortField as keyof Dons] ?? null;
      let valueB = b[this.currentSortField as keyof Dons] ?? null;

      // Handle different field types
      if (this.currentSortField === 'idDons' || this.currentSortField === 'quantite') {
        valueA = Number(valueA) || 0;
        valueB = Number(valueB) || 0;
      } else if (this.currentSortField === 'nomDoneur') {
        valueA = String(valueA || '').toLowerCase();
        valueB = String(valueB || '').toLowerCase();
      }

      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  showSuccess() {
    this.toastr.success('Operation successful!', 'Success');
  }
  validateDon(idDons: number) {
    this.donsService.validateDonsByAssociation(idDons).subscribe({
      next: (response) => {
        // Reload the entire list to get fresh data
        this.loadDons();
        this.showValidationResult('Donation successfully validated!', true);
      },
      error: (errorMessage: string) => {
        this.error = 'Failed to validate donation';
        console.error('Error validating donation:', errorMessage);
        const errorMsg = typeof errorMessage === 'string' ? errorMessage : 'Failed to validate donation';
        this.showValidationResult(errorMsg, false);
      }
    });
  }

  viewDonDetails(don: Dons) {
    this.selectedDon = don;
    this.showDonDetails = true;
  }

  closeDonDetails() {
    this.selectedDon = null;
    this.showDonDetails = false;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  startScanner() {
    this.scannerVisible = true;
    
    // Wait for the DOM to update before initializing the scanner
    setTimeout(() => {
      const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
        console.log(`Code matched = ${decodedText}`, decodedResult);
        
        // Extract the donation ID from the QR code
        const donationId = this.extractDonationId(decodedText);
        if (donationId !== null) {
          this.validateDonation(donationId);
        } else {
          this.showValidationResult('Invalid QR code format. Please try again.', false);
        }
        
        this.stopScanner();
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      this.html5QrCode = new Html5Qrcode("qr-reader");
      this.html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        qrCodeSuccessCallback,
        (errorMessage) => {
          // Ignore errors during scanning
          console.log(errorMessage);
        }
      )
        .catch((err: Error) => {
          console.error('Error:', err);
          this.showValidationResult(err.message || 'An error occurred', false);
        });
    }, 100); // Small delay to ensure DOM is updated
  }

  stopScanner() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode?.clear();
        this.html5QrCode = null;
      }).catch((err: Error) => {
        console.error('Error:', err);
        this.showValidationResult(err.message || 'An error occurred', false);
      });
    }
    this.scannerVisible = false;
  }

  private extractDonationId(qrCodeMessage: string): number | null {
    try {
      const parsed = JSON.parse(qrCodeMessage);

      if (parsed && typeof parsed.donationId === 'number' && parsed.donationId > 0) {
        return parsed.donationId;
      } else {
        console.error('Invalid donationId in QR Code:', parsed);
        return null;
      }
    } catch (error) {
      console.error('Invalid JSON format in QR Code:', error);
      return null;
    }
  }

  private validateDonation(donationId: number) {
    this.donsService.validateDonationByQrCode(donationId).subscribe({
      next: (response) => {
        // Use the message from the response
        this.showValidationResult(response.message, true);
        // Refresh the donations list after successful validation
        this.loadDons();
      },
      error: (error) => {
        console.error('Validation error:', error);
        const errorMessage = error.error?.message || 'Validation failed. Please try again.';
        this.showValidationResult(errorMessage, false);
      }
    });
  }

  private showValidationResult(message: string, success: boolean) {
    this.validationMessage = message;
    this.isSuccess = success;
    
    // Clear the message after 5 seconds
    setTimeout(() => {
      this.validationMessage = null;
    }, 5000);
  }
}