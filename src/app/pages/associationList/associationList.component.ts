import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { AssociationService } from '../../services/association.service';
import { Association, AssociationStatus } from '../../interfaces/association.interface';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
    selector: 'app-association-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './associationList.component.html',
    styleUrls: ['./associationList.component.scss']
})
export class AssociationListComponent implements OnInit {
  associations: Association[] = [];
  images: { [key: string]: SafeUrl } = {};
  loading = true;
  error: string | null = null;

  constructor(
    private associationService: AssociationService,
    private authService: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadAssociations();
  }

  loadAssociations() {
    this.loading = true;
    this.associationService.getAllAssociations().subscribe({
      next: (associations) => {
        // Filter to only include approved associations
        this.associations = associations.filter(
          association => association.status === AssociationStatus.APPROVED
        );
        this.loading = false;
  
        // Load images for each approved association
        this.associations.forEach(association => {
          if (association.associationLogoPath) {
            this.loadImage(association.idAssociation.toString(), association.associationLogoPath);
          } else {
            this.images[association.idAssociation] = '/assets/images/default-logo.png';
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load associations';
        this.loading = false;
        console.error('Error loading associations:', err);
      }
    });
  }
  

  loadImage(id: string, filename: string): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found in loadImage');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(
      `http://localhost:8089/api/associations/protected/files/${filename}`,
      { headers, responseType: 'blob' }
    ).pipe(
      catchError((error: any) => {
        console.error('Error loading image:', error);
        return throwError(() => error);
      })
    ).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        this.images[id] = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: () => this.images[id] = '/assets/images/default-logo.png'
    });
  }

  getStatusClass(status: AssociationStatus): string {
    switch (status) {
      case AssociationStatus.APPROVED:
        return 'bg-success';
      case AssociationStatus.REJECTED:
        return 'bg-secondary';
      case AssociationStatus.PENDING:
        return 'bg-warning';
      default:
        return 'bg-light';
    }
  }
}
