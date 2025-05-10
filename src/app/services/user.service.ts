import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface UserProfile {
    idUser: number;
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    job: string;
    role: string;
    cvFilePath: string;
    validationStatus: 'NOT_VALIDATED' | 'PENDING_VALIDATION' | 'VALIDATED';
}

export interface PendingVolunteer {
    idUser: number;
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    job: string;
    role: string;
    cvFilePath: string;
    validationStatus: 'PENDING_VALIDATION';
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/missions`;
    private apiiUrl = environment.apiUrl;


    constructor(private http: HttpClient, private authService: AuthService) {}

    getProfile(): Observable<UserProfile> {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json');

        return this.http.get<UserProfile>(`${this.apiUrl}/me`, { headers });
    }

    getPendingVolunteers(): Observable<PendingVolunteer[]> {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json');

        return this.http.get<PendingVolunteer[]>(`${this.apiUrl}/pending-volunteers`, { headers })
            .pipe(
                catchError(error => {
                    console.error('Error fetching pending volunteers:', error);
                    return of([]);
                })
            );
    }

    validateVolunteer(volunteerId: number, approve: boolean, rejectionReason?: string): Observable<{ message: string }> {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json');

        const request = {
            approve,
            rejectionReason: approve ? undefined : rejectionReason
        };

        return this.http.patch<{ message: string }>(
            `${this.apiUrl}/volunteers/${volunteerId}/review`,
            request,
            { headers }
        ).pipe(
            catchError(error => {
                console.error('Error validating volunteer:', error);
                throw new Error('Failed to validate volunteer. Please try again.');
            })
        );
    }

    viewCv(volunteerId: number): void {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${token}`);

        // First check if the CV file exists or if the user has a CV path
        this.http.get<PendingVolunteer>(`${this.apiUrl}/volunteers/${volunteerId}`, {
            headers
        }).pipe(
            catchError(error => {
                console.error('Error retrieving volunteer details:', error);
                alert('Could not retrieve volunteer information to check for CV.');
                return of(null);
            })
        ).subscribe(volunteer => {
            if (!volunteer) {
                return;
            }
            
            if (!volunteer.cvFilePath) {
                alert('This volunteer does not have a CV file uploaded.');
                return;
            }
            
            // Now try to get the actual CV file
            this.http.get(`${this.apiUrl}/volunteers/${volunteerId}/cv`, {
                headers,
                responseType: 'blob'
            }).subscribe({
                next: (blob: Blob) => {
                    const contentType = blob.type;
                    if (contentType.includes('pdf') || contentType.includes('application/octet-stream')) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.target = '_blank';
                        a.download = `cv_${volunteerId}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    } else {
                        console.error('Received non-PDF response when trying to view CV');
                        alert('CV file found but not in a readable format.');
                    }
                },
                error: (error) => {
                    console.error('Error viewing CV:', error);
                    
                    // Check if it's a 404 error specifically
                    if (error.status === 404) {
                        alert('CV file not found. The volunteer may not have uploaded a CV yet.');
                    } else {
                        alert('Could not retrieve the CV. You may not have permission to view it or the server is experiencing issues.');
                    }
                }
            });
        });
    }



  getUserProfileImage(filename: string): Observable<Blob> {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Accept', 'image/jpeg, image/png, image/gif');
    
    return this.http.get(`${this.apiiUrl}/protected/files/${filename}`, { 
      headers: headers,
      responseType: 'blob' 
    }).pipe(
      catchError(error => {
        // Return a default image blob if the profile image fails to load
        return this.getDefaultProfileImage();
      })
    );
  }

  private getDefaultProfileImage(): Observable<Blob> {
    // Fetch the default profile image from assets
    return this.http.get('assets/images/default-logo.jpg', {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        // Return an empty blob as last resort
        return of(new Blob());
      })
    );
  }
} 