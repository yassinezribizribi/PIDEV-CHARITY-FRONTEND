// association-details/association-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { AssociationService } from '../../../services/association.service';
import { EmailService } from '../../../services/email.service';
import { catchError, firstValueFrom, from, Observable, throwError } from 'rxjs';
import { Association, AssociationStatus } from '../../../interfaces/association.interface';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-association-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AdminNavbarComponent,
    

  ],
  templateUrl: './association-details.component.html',
  styleUrls: ['./association-details.component.css']
})
export class AssociationDetailsComponent implements OnInit {
  association: Association | null = null;
  loading = true;
  imageUrl: SafeUrl | null = null;
  isVerifying = false;
  isRejecting = false;
  actionMessage: string = '';
  showActionMessage = false;

  constructor(
    private route: ActivatedRoute,
    private associationService: AssociationService,
    private emailService: EmailService,
    private authService: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

 // association-details.component.ts
 ngOnInit() {
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    if (!id || isNaN(Number(id))) {
      this.loading = false;
      return;
    }
    
    this.associationService.getAssociationById(Number(id)).subscribe({
      next: (association) => {
        this.association = association;
        
        if (association.associationLogoPath) {
          this.loadImage(association.associationLogoPath);
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading association:', error);
        this.loading = false;
      }
    });
  });
}

  private loadAssociationDetails(id: number): void {
    this.associationService.getAssociationById(id).subscribe({
      next: (association) => {
        this.association = association;
        if (association.associationLogoPath) {
          this.loadImage(association.associationLogoPath);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading association:', error);
        this.loading = false;
      }
    });
  }

  async verifyAssociation(): Promise<void> {
    if (!this.association?.idAssociation) return;
  
    try {
      this.isVerifying = true;
      this.actionMessage = 'Verifying association...';
      this.showActionMessage = true;

      const updated = await firstValueFrom(
        this.associationService.verifyAssociation(this.association.idAssociation)
      );

      // Update local state immediately
      this.association = {
        ...this.association,
        status: AssociationStatus.APPROVED
      };

      await this.sendVerificationEmail();
      
      this.actionMessage = 'Association verified successfully!';
      setTimeout(() => {
        this.showActionMessage = false;
      }, 3000);

    } catch (error) {
      console.error('Verification failed:', error);
      this.actionMessage = 'Failed to verify association. Please try again.';
    } finally {
      this.isVerifying = false;
    }
  }
  
  async rejectAssociation(): Promise<void> {
    if (!this.association?.idAssociation) return;

    try {
      this.isRejecting = true;
      this.actionMessage = 'Rejecting association...';
      this.showActionMessage = true;

      const updated = await firstValueFrom(
        this.associationService.updateAssociation(
          this.association.idAssociation,
          { ...this.association, status: AssociationStatus.REJECTED }
        )
      );

      // Update local state immediately
      this.association = {
        ...this.association,
        status: AssociationStatus.REJECTED
      };

      await this.sendRejectionEmail();
      
      this.actionMessage = 'Association rejected successfully.';
      setTimeout(() => {
        this.showActionMessage = false;
      }, 3000);

    } catch (error) {
      console.error('Rejection failed:', error);
      this.actionMessage = 'Failed to reject association. Please try again.';
    } finally {
      this.isRejecting = false;
    }
  }

  private async sendVerificationEmail(): Promise<void> {
    if (!this.association?.subscriber?.email || !this.association.associationName) return;

    try {
      await firstValueFrom(
        from(this.emailService.sendVerificationEmail(
          this.association.subscriber.email,
          this.association.associationName
        ))
      );
    } catch (err) {
      console.error('Failed to send verification email', err);
    }
  }

  private async sendRejectionEmail(): Promise<void> {
    if (!this.association?.subscriber?.email || !this.association.associationName) return;

    try {
      await firstValueFrom(
        from(this.emailService.sendRejectionEmail(
          this.association.subscriber.email,
          this.association.associationName
        ))
      );
    } catch (err) {
      console.error('Failed to send rejection email', err);
    }
  }

  loadImage(filename: string): void {
    const token = this.authService.getToken();
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get(
      `http://localhost:8089/api/associations/protected/files/${filename}`,
      { headers, responseType: 'blob' }
    ).pipe(
      catchError(error => {
        console.error('Image load error:', error);
        return throwError(() => error);
      })
    ).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: () => this.imageUrl = null
    });
  }

  getDocument(documentPath: string | File): Observable<Blob> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => 'No token found');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const filename = typeof documentPath === 'string' ? documentPath : documentPath.name;

    return this.http.get(
      `http://localhost:8089/api/associations/protected/files/${filename}`,
      { headers, responseType: 'blob' }
    ).pipe(
      catchError(error => {
        console.error('Document load error:', error);
        return throwError(() => error);
      })
    );
  }

  downloadDocument(documentPath: string | File): void {
    this.getDocument(documentPath).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = typeof documentPath === 'string' 
          ? documentPath.split('/').pop() || 'document'
          : documentPath.name;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Download failed:', error);
        if (error.status === 401) {
          console.error('Unauthorized - please login again');
        }
      }
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Operation failed. Please try again.'));
  }
}