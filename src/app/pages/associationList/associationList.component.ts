import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { AssociationService } from '../../services/association.service';
import { Association, AssociationStatus } from '../../interfaces/association.interface';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
    selector: 'app-association-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        FooterComponent,
        ScrollToTopComponent,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatChipsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatPaginatorModule
    ],
    template: `
        <app-navbar></app-navbar>

        <!-- Hero Section -->
        <section class="bg-half-170 d-table w-100" style="background: url('assets/images/hero/pages.jpg') center;">
            <div class="bg-overlay bg-gradient-overlay"></div>
            <div class="container">
                <div class="row mt-5 justify-content-center">
                    <div class="col-12">
                        <div class="title-heading text-center">
                            <h5 class="heading fw-semibold mb-0 sub-heading text-white title-dark">
                                Our Associations
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Filter Section -->
        <section class="section pt-4">
            <div class="container">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="filter-container p-4 bg-white rounded-3 shadow-sm">
                            <div class="row g-3">
                                <!-- Search -->
                                <div class="col-md-4">
                                    <mat-form-field appearance="outline" class="w-100">
                                        <mat-label>Search Associations</mat-label>
                                        <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange($event)">
                                        <mat-icon matSuffix>search</mat-icon>
                                    </mat-form-field>
                                </div>

                                <!-- Location Filter -->
                                <div class="col-md-4">
                                    <mat-form-field appearance="outline" class="w-100">
                                        <mat-label>Filter by Location</mat-label>
                                        <mat-select [(ngModel)]="selectedLocation" (selectionChange)="applyFilters()">
                                            <mat-option value="">All Locations</mat-option>
                                            <mat-option *ngFor="let location of uniqueLocations" [value]="location">
                                                {{location}}
                                            </mat-option>
                                        </mat-select>
                                    </mat-form-field>
                                </div>

                                <!-- Partnership Tier Filter -->
                                <div class="col-md-4">
                                    <mat-form-field appearance="outline" class="w-100">
                                        <mat-label>Filter by Partnership Tier</mat-label>
                                        <mat-select [(ngModel)]="selectedTier" (selectionChange)="applyFilters()">
                                            <mat-option value="">All Tiers</mat-option>
                                            <mat-option value="GOLD">Gold Partners</mat-option>
                                            <mat-option value="SILVER">Silver Partners</mat-option>
                                            <mat-option value="BRONZE">Bronze Partners</mat-option>
                                        </mat-select>
                                    </mat-form-field>
                                </div>
                            </div>

                            <!-- Active Filters -->
                            <div class="mt-3" *ngIf="hasActiveFilters">
                                <mat-chip-listbox>
                                    <mat-chip *ngIf="searchTerm" (removed)="clearSearch()">
                                        Search: {{searchTerm}}
                                        <button matChipRemove>
                                            <mat-icon>cancel</mat-icon>
                                        </button>
                                    </mat-chip>
                                    <mat-chip *ngIf="selectedLocation" (removed)="clearLocation()">
                                        Location: {{selectedLocation}}
                                        <button matChipRemove>
                                            <mat-icon>cancel</mat-icon>
                                        </button>
                                    </mat-chip>
                                    <mat-chip *ngIf="selectedTier" (removed)="clearTier()">
                                        Tier: {{selectedTier}}
                                        <button matChipRemove>
                                            <mat-icon>cancel</mat-icon>
                                        </button>
                                    </mat-chip>
                                </mat-chip-listbox>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div *ngIf="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-muted">Loading associations...</p>
                </div>

                <!-- Error State -->
                <div *ngIf="error" class="alert alert-danger" role="alert">
                    ⚠️ {{ error }}
                </div>

                <!-- No Results -->
                <div *ngIf="!loading && !error && paginatedAssociations.length === 0" class="text-center py-5">
                    <mat-icon class="text-muted" style="font-size: 48px; width: 48px; height: 48px;">search_off</mat-icon>
                    <p class="mt-3 text-muted">No associations found matching your criteria.</p>
                </div>

                <!-- Association Cards -->
                <div *ngIf="!loading && !error && paginatedAssociations.length > 0" class="row g-4">
                    <div *ngFor="let association of paginatedAssociations" class="col-lg-4 col-md-6 col-12">
                        <div class="card position-relative overflow-hidden shadow rounded-3 border-0 hover-translate-y">
                            <!-- Partnership Tier Badge -->
                            <div class="tier-badge" [ngClass]="getTierClass(association.partnershipTier || 'Bronze')">
                                <mat-icon>{{getTierIcon(association.partnershipTier || 'Bronze')}}</mat-icon>
                                {{association.partnershipTier || 'Bronze'}}
                            </div>
                            
                            <!-- Image -->
                            <div class="association-image position-relative overflow-hidden">
                                <img [src]="images[association.idAssociation] || '/assets/images/default-logo.jpg'"
                                     [alt]="association.associationName"
                                     class="img-fluid w-100 object-fit-cover"
                                     style="height: 200px;">
                                <div class="overlay-gradient"></div>
                            </div>

                            <!-- Content -->
                            <div class="card-body p-4">
                                <h5 class="card-title text-dark mb-3">{{ association.associationName }}</h5>
                                <div class="d-flex align-items-center mb-3">
                                    <mat-icon class="text-muted me-2">location_on</mat-icon>
                                    <span class="text-muted">{{ association.associationAddress }}</span>
                                </div>
                                <p class="card-text text-muted">{{ association.description | slice:0:150 }}...</p>
                                
                                <!-- Partnership Score -->
                                <div class="partnership-score mb-3">
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar bg-primary" 
                                             [style.width.%]="getScorePercentage(association.partnershipScore)">
                                        </div>
                                    </div>
                                    <small class="text-muted mt-1 d-block">
                                        Partnership Score: {{association.partnershipScore || 0}}/100
                                    </small>
                                </div>
                                
                                <!-- Action Buttons -->
                                <div class="d-flex justify-content-between align-items-center mt-4">
                                    <button mat-stroked-button color="primary" [routerLink]="['/associations', association.idAssociation]">
                                        View Profile
                                    </button>
                                    <button mat-flat-button color="primary" (click)="subscribe(association)">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="row mt-4">
                    <div class="col-12 d-flex justify-content-center">
                        <mat-paginator
                            [length]="totalItems"
                            [pageSize]="pageSize"
                            [pageSizeOptions]="[6, 12, 24]"
                            (page)="onPageChange($event)"
                            aria-label="Select page">
                        </mat-paginator>
                    </div>
                </div>
            </div>
        </section>

        <app-footer></app-footer>
        <app-scroll-to-top></app-scroll-to-top>
    `,
    styles: [`
        .filter-container {
            border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .hover-translate-y {
            transition: transform 0.3s ease;
        }

        .hover-translate-y:hover {
            transform: translateY(-10px);
        }

        .tier-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 2;
        }

        .tier-badge mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
        }

        .tier-gold {
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
        }

        .tier-silver {
            background: linear-gradient(135deg, #C0C0C0, #A9A9A9);
            color: #000;
        }

        .tier-bronze {
            background: linear-gradient(135deg, #CD7F32, #8B4513);
            color: #fff;
        }

        .overlay-gradient {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 50%;
            background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
        }

        .association-image {
            height: 200px;
            background-color: #f8f9fa;
        }

        .partnership-score {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 8px;
        }

        .progress {
            background-color: rgba(0,0,0,0.1);
        }

        .card {
            transition: all 0.3s ease;
        }

        .card:hover {
            box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
    `]
})
export class AssociationListComponent implements OnInit {
    // Pagination properties
    pageSize = 6;
    currentPage = 0;
    totalItems = 0;
    
    associations: Association[] = [];
    filteredAssociations: Association[] = [];
    paginatedAssociations: Association[] = [];
    images: { [key: string]: SafeUrl } = {};
    loading = true;
    error: string | null = null;

    // Filter properties
    searchTerm = '';
    selectedLocation = '';
    selectedTier = '';
    uniqueLocations: string[] = [];
    private searchSubject = new Subject<string>();

    constructor(
        private associationService: AssociationService,
        private authService: AuthService,
        private sanitizer: DomSanitizer,
        private http: HttpClient
    ) {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(() => {
            this.currentPage = 0; // Reset to first page on search
            this.loadAssociations();
        });
    }

    ngOnInit() {
        this.loadAssociations();
    }

    loadAssociations() {
        this.loading = true;
        const filters = {
            search: this.searchTerm,
            location: this.selectedLocation,
            tier: this.selectedTier,
            page: this.currentPage,
            size: this.pageSize
        };

        this.associationService.getPaginatedAssociations(filters).subscribe({
            next: (response) => {
                this.associations = response.content || [];
                this.paginatedAssociations = [...this.associations];
                this.totalItems = response.totalElements || 0;
                
                this.extractUniqueLocations();
                this.loading = false;

                if (this.paginatedAssociations.length > 0) {
                    this.paginatedAssociations.forEach(association => {
                        if (association.associationLogoPath) {
                            this.loadImage(association.idAssociation.toString(), association.associationLogoPath);
                        }
                    });
                }
            },
            error: () => {
                this.error = 'Failed to load associations';
                this.loading = false;
                this.associations = [];
                this.paginatedAssociations = [];
                this.totalItems = 0;
            }
        });
    }

    onPageChange(event: PageEvent) {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadAssociations();
    }

    private loadImage(id: string, filename: string): void {
        this.associationService.getAssociationLogo(filename).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                this.images[id] = this.sanitizer.bypassSecurityTrustUrl(url);
            },
            error: () => {
                this.images[id] = '/assets/images/default-logo.jpg';
            }
        });
    }

    onSearchChange(term: string) {
        this.searchSubject.next(term);
    }

    applyFilters() {
        this.currentPage = 0; // Reset to first page when filters change
        this.loadAssociations();
    }

    private extractUniqueLocations() {
        const locations = new Set<string>();
        this.associations.forEach(association => {
            if (association.associationAddress) {
                locations.add(association.associationAddress);
            }
        });
        this.uniqueLocations = Array.from(locations);
    }

    getTierIcon(tier: string): string {
        switch (tier.toLowerCase()) {
            case 'gold':
                return 'military_tech';
            case 'silver':
                return 'workspace_premium';
            case 'bronze':
                return 'emoji_events';
            default:
                return 'emoji_events';
        }
    }

    getTierClass(tier: string): string {
        return `tier-${tier.toLowerCase()}`;
    }

    getScorePercentage(score: number | undefined): number {
        return score || 0;
    }

    get hasActiveFilters(): boolean {
        return !!(this.searchTerm || this.selectedLocation || this.selectedTier);
    }

    clearSearch() {
        this.searchTerm = '';
        this.applyFilters();
    }

    clearLocation() {
        this.selectedLocation = '';
        this.applyFilters();
    }

    clearTier() {
        this.selectedTier = '';
        this.applyFilters();
    }

    subscribe(association: Association) {
        // Implement subscription logic
    }
}
