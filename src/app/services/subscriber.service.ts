import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subscriber {
    idUser: number;
    email: string;
    telephone: string;
    job: string;
    role: string;
    validationStatus: 'VALIDATED' | 'NOT_VALIDATED' | 'PENDING_VALIDATION';
}

@Injectable({
    providedIn: 'root'
})
export class SubscriberService {
    private baseUrl = 'http://localhost:8089/api/missions';

    constructor(private http: HttpClient) {}

    getCurrentSubscriber(): Observable<Subscriber> {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json');

        return this.http.get<Subscriber>(`${this.baseUrl}/me`, { headers });
    }
} 