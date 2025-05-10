import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, switchMap, forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { 
  Association, 
  PartnerAssociation, 
  PartnershipTier,
  PartnershipTierLevel,
  PartnershipImpactReport,
  AssociationStatus 
} from '../interfaces/association.interface';
import { Router } from '@angular/router';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AssociationFilters {
  search?: string;
  location?: string;
  tier?: string;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class AssociationService {
  private apiUrl = 'http://localhost:8089/api/associations';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  private handleError(error: any) {
    if (error.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
    return throwError(() => error);
  }

  // ============== TIER MANAGEMENT ==============
  getPartnershipTier(associationId: number): Observable<PartnershipTier> {
    return this.http.get<PartnershipTier>(
      `${this.apiUrl}/${associationId}/partnership-tier`,
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      map(response => ({
        ...response,
        benefits: this.parseTierBenefits(response.tier),
        canUpgrade: this.canUpgradeTier(response.tier) // Just check if upgrade is possible
      })),
      catchError(this.handleError)
    );
  }

  getTierRequirements(currentTier: string): { score: number, partners: number } {
    switch(currentTier?.toUpperCase()) {
      case 'BRONZE': return { score: 31, partners: 5 };
      case 'SILVER': return { score: 61, partners: 10 };
      default: return { score: 0, partners: 0 }; // GOLD has no requirements
    }
  }

  getTierProgress(association: Association): { scoreProgress: number, partnerProgress: number } {
    const requirements = this.getTierRequirements(association.partnershipTier || 'BRONZE');
    return {
      scoreProgress: requirements.score > 0 
        ? Math.min(100, Math.round((association.partnershipScore || 0) / requirements.score * 100))
        : 100,
      partnerProgress: requirements.partners > 0
        ? Math.min(100, Math.round((association.partners?.length || 0) / requirements.partners * 100))
        : 100
    };
  }

  getPartners(associationId?: number): Observable<PartnerAssociation[]> {
    const url = associationId 
      ? `${this.apiUrl}/${associationId}/partners`
      : `${this.apiUrl}/partners`;
    
    return this.http.get<PartnerAssociation[]>(url, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getPartnerLogo(filename: string): Observable<Blob> {
    return this.getAssociationLogo(filename);
  }

  getPotentialPartnerLogo(filename: string): Observable<Blob> {
    return this.getAssociationLogo(filename);
  }

  updateAllTiers(): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-tiers`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private canUpgradeTier(currentTier: string): boolean {
    return currentTier !== PartnershipTierLevel.GOLD;
  }

  upgradeTier(associationId: number, targetTier: string): Observable<{ newTier: PartnershipTierLevel }> {
    return this.getPartnershipTier(associationId).pipe(
      switchMap(tierInfo => {
        const currentTier = tierInfo.tier || tierInfo.currentTier || 'BRONZE';

        let params = new HttpParams()
          .set('currentTier', currentTier.toUpperCase())
          .set('targetTier', targetTier.toUpperCase())
          .set('reason', 'USER_REQUESTED');

        return this.http.post<{ newTier: PartnershipTierLevel }>(
          `${this.apiUrl}/tier-upgrade/${associationId}`,
          null,
          { 
            headers: this.authService.getAuthHeaders(),
            params: params
          }
        );
      }),
      switchMap(response => {
        return forkJoin({
          upgrade: of(response),
          freshData: this.getAssociationById(associationId)
        });
      }),
      map(({ upgrade }) => upgrade),
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => new Error('Tier upgrade service is not available. Please try again later.'));
        }
        return throwError(() => error);
      })
    );
  }


  getNextTier(currentTier: string): string {
    switch(currentTier?.toUpperCase()) {
      case 'BRONZE': return 'SILVER';
      case 'SILVER': return 'GOLD';
      default: return currentTier;
    }
  }

  getTierUpgradeCost(currentTier: string): number {
    switch(currentTier?.toUpperCase()) {
      case 'BRONZE': return 100;
      case 'SILVER': return 200;
      default: return 0;
    }
  }

  getPartnerMaxLimit(tier: string): number {
    switch(tier?.toUpperCase()) {
      case 'GOLD': return 10;
      case 'SILVER': return 5;
      default: return 3; // BRONZE
    }
  }

  // ============== PARTNERSHIP METHODS ==============
  createPartnership(associationId: number, partnerId: number): Observable<{ 
    newTier: string, 
    newScore: number,
    partnerCount: number 
  }> {
    return this.http.post<{ 
      newTier: string, 
      newScore: number,
      partnerCount: number 
    }>(
      `${this.apiUrl}/${associationId}/partners/${partnerId}`,
      {},
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to create partnership';
        throw new Error(errorMessage);
      })
    );
  }

  removePartnership(associationId: number, partnerId: number): Observable<{ 
    newTier: string, 
    newScore: number,
    partnerCount: number 
  }> {
    return this.http.delete<{ 
      newTier: string, 
      newScore: number,
      partnerCount: number 
    }>(
      `${this.apiUrl}/${associationId}/partners/${partnerId}`,
      { headers: this.authService.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getRecommendedPartners(associationId: number): Observable<Association[]> {
    return this.http.get<Association[]>(
      `${this.apiUrl}/${associationId}/partner-recommendations`,
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      map(associations => {
        return associations
          .filter(partner => 
            (partner.partners?.length || 0) < this.getPartnerMaxLimit(partner.partnershipTier || 'BRONZE')
          )
          .sort((a, b) => {
            const aAvailable = (a.partners?.length || 0) < this.getPartnerMaxLimit(a.partnershipTier || 'BRONZE') ? 1 : 0;
            const bAvailable = (b.partners?.length || 0) < this.getPartnerMaxLimit(b.partnershipTier||'BRONZE') ? 1 : 0;
            
            if (aAvailable !== bAvailable) return bAvailable - aAvailable;
            return (b.similarityScore || 0) - (a.similarityScore || 0);
          });
      }),
      catchError(this.handleError)
    );
  }

  // ============== IMPACT REPORT ==============
  generateImpactReport(associationId: number): Observable<PartnershipImpactReport> {
    return this.http.get<PartnershipImpactReport>(
      `${this.apiUrl}/${associationId}/partnership-impact`,
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      map(report => ({
        ...report,
        efficiencyImprovement: Math.round(report.efficiencyImprovement * 100) / 100
      })),
      catchError(this.handleError)
    );
  }

  // ============== ASSOCIATION CRUD ==============
  getAssociationByUserId(userId: string): Observable<Association> {
    return this.http.get<Association>(`${this.apiUrl}`, { 
      headers: this.authService.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  getAssociationById(id: number): Observable<Association> {
    return this.http.get<Association>(`${this.apiUrl}/${id}`, { 
      headers: this.authService.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  getAllAssociations(): Observable<Association[]> {
    return this.http.get<Association[]>(`${this.apiUrl}/list`, { 
      headers: this.authService.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  createAssociation(formData: FormData): Observable<Association> {
    return this.http.post<Association>(this.apiUrl, formData, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateAssociation(id: number, association: Association): Observable<Association> {
    return this.http.put<Association>(
      `${this.apiUrl}/${id}`,
      association,
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  verifyAssociation(id: number): Observable<Association> {
    return this.http.patch<Association>(
      `${this.apiUrl}/verify/${id}`,
      { status: AssociationStatus.APPROVED },
      { headers: this.authService.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  deleteAssociation(id: number): Observable<void> {
    // Get the token and ensure it's properly formatted
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    // Create headers with properly formatted token
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    // Log the request details for debugging
    console.log('Deleting association with ID:', id);
    console.log('Request URL:', `${this.apiUrl}/${id}`);
    console.log('Headers:', headers);

    // Delete the association directly
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers,
      observe: 'response'
    }).pipe(
      tap(response => {
        console.log('Delete response:', response);
      }),
      map(response => {
        // Return void for both 200 and 204 responses
        return;
      }),
      catchError(error => {
        console.error('Error in deleteAssociation:', error);
        
        // Only handle 401 errors with logout
        if (error.status === 401) {
          this.authService.logout();
          return throwError(() => new Error('Authentication failed'));
        }
        
        // For other errors, just pass them through
        return throwError(() => error);
      })
    );
  }

  // ============== FILE HANDLING ==============
  getAssociationLogo(filename: string): Observable<Blob> {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Accept', 'image/jpeg, image/png, image/gif');
    
    return this.http.get(`${this.apiUrl}/protected/files/${filename}`, { 
      headers: headers,
      responseType: 'blob' 
    }).pipe(
      catchError(error => {
        // Return a default image blob if the logo fails to load
        return this.getDefaultLogo();
      })
    );
  }

  private getDefaultLogo(): Observable<Blob> {
    // Fetch the default logo from assets
    return this.http.get('assets/images/default-logo.jpg', {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        // Return an empty blob as last resort
        return of(new Blob());
      })
    );
  }

  uploadFile(formData: FormData): Observable<{ filePath: string }> {
    return this.http.post<{ filePath: string }>(
      `${this.apiUrl}/upload`, 
      formData,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // ============== HELPER METHODS ==============
  parseTierBenefits(tier?: string): string[] {
    const benefitsMap = {
      BRONZE: [
        'Up to 3 partner associations',
        'Basic collaboration tools',
        'Monthly partnership reports'
      ],
      SILVER: [
        'Up to 5 partner associations',
        'Advanced analytics dashboard',
        'Partner recommendation engine',
        'Weekly efficiency reports',
        'Priority support'
      ],
      GOLD: [
        'Up to 10 partner associations',
        'Premium collaboration tools',
        'Real-time analytics',
        'Joint funding opportunities',
        'Custom impact reports',
        'Partner success manager',
        'Priority matching'
      ]
    };

    const normalizedTier = (tier || 'BRONZE').toUpperCase() as keyof typeof benefitsMap;
    return benefitsMap[normalizedTier] || benefitsMap.BRONZE;
  }

  // ============== USER EMAIL METHODS ==============
  getUserEmailByAssociationId(associationId: number): Observable<string> {
    return this.http.get<{ email: string }>(`${this.apiUrl}/${associationId}/user-email`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(response => response.email),
      catchError(this.handleError)
    );
  }

  getPaginatedAssociations(filters: AssociationFilters): Observable<PageResponse<Association>> {
    return this.http.get<Association[]>(`${this.apiUrl}/list`, { 
      headers: this.authService.getAuthHeaders() 
    }).pipe(
      map(associations => {
        let filteredAssociations = associations.filter(a => a.status === AssociationStatus.APPROVED);

        if (filters.search && filters.search.trim()) {
          const searchTerm = filters.search.toLowerCase();
          filteredAssociations = filteredAssociations.filter(a => 
            a.associationName.toLowerCase().includes(searchTerm) ||
            (a.description?.toLowerCase() || '').includes(searchTerm)
          );
        }

        if (filters.location && filters.location.trim()) {
          filteredAssociations = filteredAssociations.filter(a => 
            a.associationAddress?.includes(filters.location || '')
          );
        }

        if (filters.tier && filters.tier.trim()) {
          filteredAssociations = filteredAssociations.filter(a => {
            const associationTier = a.partnershipTier?.toUpperCase() || '';
            const filterTier = filters.tier?.toUpperCase() || '';
            return associationTier === filterTier;
          });
        }

        const totalElements = filteredAssociations.length;
        const start = filters.page * filters.size;
        const end = start + filters.size;
        const paginatedContent = filteredAssociations.slice(start, end);

        return {
          content: paginatedContent,
          totalElements,
          totalPages: Math.ceil(totalElements / filters.size),
          size: filters.size,
          number: filters.page
        };
      })
    );
  }

  updateUser(user: { idUser: number; firstName: string; lastName: string; photo?: string | null; isBanned?: boolean; banreason?: string | null }) {
    return this.http.put(`${this.apiUrl}/users/${user.idUser}`, user, {
      headers: this.authService.getAuthHeaders()
    });
  }
}