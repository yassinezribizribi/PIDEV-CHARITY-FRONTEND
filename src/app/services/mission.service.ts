import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { Mission } from '../interfaces/mission.interface';
import { Router } from '@angular/router';
import { MissionRole } from '../interfaces/mission-role.interface';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface ParticipationMissionDTO {
    participationId: number;
    missionTitle: string;
    missionDescription: string;
    location: string;
    startDate: Date;
    endDate: Date;
    status: string;
    roleName: string;
    numberNeeded: number;
    numberAccepted: number;
    requiresValidation: boolean;
}

export interface ReviewParticipationDTO {
    approve: boolean;
    rejectionReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private apiUrl = environment.apiUrl + '/missions';

  constructor(private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}
// Method to get missions by association ID from the token
getMissionsByAssociation(): Observable<Mission[]> {
  const token = localStorage.getItem('auth_token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
  return this.http.get<Mission[]>(`${this.apiUrl}/my-missions`, { headers });
}

  getMissions(): Observable<Mission[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Mission[]>(`${this.apiUrl}/getall`, { headers });
  }

  getMissionById(id: number): Observable<Mission> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Mission>(`${this.apiUrl}/get/${id}`, { headers });
  }

  createMission(
    title: string,
    description: string,
    location: string,
    startDate: Date,
    endDate: Date,
    status: string,
    missionLogo?: File,
    missionRoles?: MissionRole[]
  ): Observable<Mission> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('startDate', startDate.toISOString().split('T')[0]);
    formData.append('endDate', endDate.toISOString().split('T')[0]);
    formData.append('status', status);

    if (missionLogo) {
      formData.append('missionLogo', missionLogo);
    }

    if (missionRoles && missionRoles.length > 0) {
      formData.append('missionRoles', JSON.stringify(missionRoles));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.post<Mission>(`${this.apiUrl}/createmission`, formData, { headers });
  }

  updateMission(id: number, mission: Mission): Observable<Mission> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<Mission>(`${this.apiUrl}/update/${id}`, mission, { headers });
  }

  deleteMission(id: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers });
  }


// New method to get missions by location
getMissionsByLocation(location: string): Observable<Mission[]> {
  const token = localStorage.getItem('auth_token');
  const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');

  // Sending the GET request with location as a parameter
  return this.http.get<Mission[]>(`${this.apiUrl}/by-location/${location}`, { headers });
}

  // Method to review a volunteer
  reviewVolunteer(id: number, isApprove: boolean, rejectionReason?: string): Observable<string> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    const request = {
      approve: isApprove,
      rejectionReason: rejectionReason
    };

    return this.http.patch<string>(`${this.apiUrl}/volunteers/${id}/review`, request, { headers });
  }

  // Method to upload CV
  uploadCV(cvFile: File): Observable<string> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('cvFile', cvFile);

    return this.http.post<string>(`${this.apiUrl}/upload-cv`, formData, { headers });
  }

  // Method to download CV
  downloadCV(filename: string): Observable<Blob> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/protected/files/${encodeURIComponent(filename)}`, {
      headers,
      responseType: 'blob'
    });
  }

  // Method to apply to a mission role
  applyToMissionRole(roleId: number): Observable<string> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<string>(`${this.apiUrl}/mission-roles/${roleId}/apply`, {}, { 
      headers,
      responseType: 'text' as 'json' // This tells Angular to expect a text response
    });
  }

  // Method to get mission roles by mission ID
  getMissionRolesByMissionId(missionId: number): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${this.apiUrl}/mission-roles/${missionId}`, { headers });
  }

  getMyMissionParticipations(): Observable<ParticipationMissionDTO[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<ParticipationMissionDTO[]>(`${this.apiUrl}/mine`, { headers });
  }

  cancelParticipation(participationId: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.delete<void>(`${this.apiUrl}/cancel/${participationId}`, { headers });
  }

  getCvFile(filename: string): Observable<Blob> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/protected/files/${filename}`, {
      headers,
      responseType: 'blob'
    });
  }

  getMissionLogo(logoPath: string): Observable<Blob> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get(`${this.apiUrl}/protected/files/${encodeURIComponent(logoPath)}`, {
      responseType: 'blob',
      headers
    });
  }

} 