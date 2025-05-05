import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    private apiUrl = 'http://localhost:8089/api/missions';

    constructor(private http: HttpClient) {}

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

        return this.http.get<PendingVolunteer[]>(`${this.apiUrl}/pending-volunteers`, { headers });
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
        );
    }

    viewCv(volunteerId: number): void {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${token}`);

        this.http.get(`${this.apiUrl}/volunteers/${volunteerId}/cv`, {
            headers,
            responseType: 'blob'
        }).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.download = `cv_${volunteerId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            },
            error: (error) => {
                console.error('Error viewing CV:', error);
                throw error;
            }
        });
    }
} 